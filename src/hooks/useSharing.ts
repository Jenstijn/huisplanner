import { useState, useCallback, useEffect } from 'react'
import {
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { Layout, Share, SharePermission, ShareInvite } from '../types'

// Genereer een random share token
const generateShareToken = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)

interface UseSharingOptions {
  userId: string | null
  userEmail?: string | null
  userName?: string | null
}

export function useSharing({ userId, userEmail, userName }: UseSharingOptions) {
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingInvites, setPendingInvites] = useState<ShareInvite[]>([])

  // ========================================
  // EFFECT: Check voor pending invites bij login
  // ========================================
  useEffect(() => {
    if (!userEmail) {
      setPendingInvites([])
      return
    }

    const checkPendingInvites = async () => {
      try {
        const invitesQuery = query(
          collection(db, 'shareInvites'),
          where('email', '==', userEmail.toLowerCase()),
          where('status', '==', 'pending')
        )
        const snapshot = await getDocs(invitesQuery)

        const invites: ShareInvite[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          invites.push({
            id: doc.id,
            email: data.email,
            shareId: data.shareId,
            invitedBy: data.invitedBy,
            invitedByName: data.invitedByName,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date()
          })
        })

        setPendingInvites(invites)

        // Auto-accept alle pending invites
        if (userId && invites.length > 0) {
          for (const invite of invites) {
            await acceptShareByInvite(invite)
          }
        }
      } catch (err) {
        console.error('Error checking pending invites:', err)
      }
    }

    checkPendingInvites()
  }, [userEmail, userId])

  // ========================================
  // Helper: Accepteer share via invite
  // ========================================
  const acceptShareByInvite = async (invite: ShareInvite) => {
    if (!userId) return

    try {
      // Voeg user toe aan share
      const shareRef = doc(db, 'shares', invite.shareId)
      await updateDoc(shareRef, {
        sharedWith: arrayUnion(userId),
        updatedAt: serverTimestamp()
      })

      // Update invite status
      const inviteRef = doc(db, 'shareInvites', invite.id)
      await updateDoc(inviteRef, {
        status: 'accepted'
      })

      console.log(`✅ Auto-accepted share invite from ${invite.invitedByName || 'unknown'}`)
    } catch (err) {
      console.error('Error accepting invite:', err)
    }
  }

  // ========================================
  // Maak een deellink voor een layout
  // ========================================
  const createShareLink = useCallback(async (
    layout: Layout,
    permission: SharePermission = 'view'
  ): Promise<string | null> => {
    if (!userId) return null

    setSharing(true)
    setError(null)

    try {
      const token = generateShareToken()

      // Check of er al een share bestaat voor deze layout
      const existingQuery = query(
        collection(db, 'shares'),
        where('ownerId', '==', userId),
        where('layoutId', '==', layout.id)
      )
      const existingDocs = await getDocs(existingQuery)

      let shareId: string

      if (!existingDocs.empty) {
        // Update bestaande share met nieuwe link
        shareId = existingDocs.docs[0].id
        await updateDoc(doc(db, 'shares', shareId), {
          shareLink: token,
          permission,
          layoutSnapshot: layout,
          updatedAt: serverTimestamp()
        })
      } else {
        // Maak nieuwe share aan
        const shareRef = await addDoc(collection(db, 'shares'), {
          ownerId: userId,
          ownerEmail: userEmail,
          ownerName: userName,
          layoutId: layout.id,
          layoutNaam: layout.naam,
          layoutSnapshot: layout,
          permission,
          sharedWith: [],
          shareLink: token,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        shareId = shareRef.id
      }

      setSharing(false)
      // Return de volledige URL
      return `${window.location.origin}/share/${token}`
    } catch (err) {
      console.error('Error creating share link:', err)
      setError(err instanceof Error ? err.message : 'Fout bij maken deellink')
      setSharing(false)
      return null
    }
  }, [userId, userEmail, userName])

  // ========================================
  // Nodig iemand uit via e-mail
  // ========================================
  const inviteByEmail = useCallback(async (
    layout: Layout,
    email: string,
    permission: SharePermission = 'edit'
  ): Promise<boolean> => {
    if (!userId) return false

    const normalizedEmail = email.toLowerCase().trim()

    // Valideer e-mail
    if (!normalizedEmail.includes('@')) {
      setError('Ongeldig e-mailadres')
      return false
    }

    setSharing(true)
    setError(null)

    try {
      // Check of er al een share bestaat voor deze layout
      const existingQuery = query(
        collection(db, 'shares'),
        where('ownerId', '==', userId),
        where('layoutId', '==', layout.id)
      )
      const existingDocs = await getDocs(existingQuery)

      let shareId: string

      if (!existingDocs.empty) {
        shareId = existingDocs.docs[0].id
        // Update permission als nodig
        await updateDoc(doc(db, 'shares', shareId), {
          permission,
          layoutSnapshot: layout,
          updatedAt: serverTimestamp()
        })
      } else {
        // Maak nieuwe share aan
        const shareRef = await addDoc(collection(db, 'shares'), {
          ownerId: userId,
          ownerEmail: userEmail,
          ownerName: userName,
          layoutId: layout.id,
          layoutNaam: layout.naam,
          layoutSnapshot: layout,
          permission,
          sharedWith: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        shareId = shareRef.id
      }

      // Check of user al bestaat (check of er al een invite bestaat)
      const existingInviteQuery = query(
        collection(db, 'shareInvites'),
        where('email', '==', normalizedEmail),
        where('shareId', '==', shareId)
      )
      const existingInvites = await getDocs(existingInviteQuery)

      if (existingInvites.empty) {
        // Maak nieuwe invite aan
        await addDoc(collection(db, 'shareInvites'), {
          email: normalizedEmail,
          shareId,
          invitedBy: userId,
          invitedByName: userName,
          status: 'pending',
          createdAt: serverTimestamp()
        })
      }

      setSharing(false)
      return true
    } catch (err) {
      console.error('Error inviting by email:', err)
      setError(err instanceof Error ? err.message : 'Fout bij uitnodigen')
      setSharing(false)
      return false
    }
  }, [userId, userEmail, userName])

  // ========================================
  // Accepteer een share (via link token)
  // ========================================
  const acceptShareByToken = useCallback(async (token: string): Promise<{ success: boolean; shareId?: string }> => {
    if (!userId) return { success: false }

    try {
      // Zoek share met dit token
      const sharesQuery = query(
        collection(db, 'shares'),
        where('shareLink', '==', token)
      )
      const snapshot = await getDocs(sharesQuery)

      if (snapshot.empty) {
        setError('Ongeldige of verlopen deellink')
        return { success: false }
      }

      const shareDoc = snapshot.docs[0]
      const shareId = shareDoc.id
      const shareData = shareDoc.data()

      // Check of user niet al toegang heeft
      if (shareData.sharedWith?.includes(userId)) {
        // Al toegang - return success
        return { success: true, shareId }
      }

      // Check of dit niet de eigenaar is
      if (shareData.ownerId === userId) {
        setError('Je kunt je eigen layout niet accepteren')
        return { success: false }
      }

      // Voeg user toe aan sharedWith
      await updateDoc(doc(db, 'shares', shareId), {
        sharedWith: arrayUnion(userId),
        updatedAt: serverTimestamp()
      })

      return { success: true, shareId }
    } catch (err) {
      console.error('Error accepting share:', err)
      setError(err instanceof Error ? err.message : 'Fout bij accepteren')
      return { success: false }
    }
  }, [userId])

  // ========================================
  // Verwijder een user van een share
  // ========================================
  const removeUserFromShare = useCallback(async (
    shareId: string,
    targetUserId: string
  ): Promise<boolean> => {
    if (!userId) return false

    try {
      await updateDoc(doc(db, 'shares', shareId), {
        sharedWith: arrayRemove(targetUserId),
        updatedAt: serverTimestamp()
      })
      return true
    } catch (err) {
      console.error('Error removing user from share:', err)
      setError(err instanceof Error ? err.message : 'Fout bij verwijderen')
      return false
    }
  }, [userId])

  // ========================================
  // Intrekken van deellink
  // ========================================
  const revokeShareLink = useCallback(async (shareId: string): Promise<boolean> => {
    if (!userId) return false

    try {
      await updateDoc(doc(db, 'shares', shareId), {
        shareLink: null,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (err) {
      console.error('Error revoking share link:', err)
      setError(err instanceof Error ? err.message : 'Fout bij intrekken link')
      return false
    }
  }, [userId])

  // ========================================
  // Verwijder een share volledig
  // ========================================
  const deleteShare = useCallback(async (shareId: string): Promise<boolean> => {
    if (!userId) return false

    try {
      // Verwijder ook alle gerelateerde invites
      const invitesQuery = query(
        collection(db, 'shareInvites'),
        where('shareId', '==', shareId)
      )
      const invitesSnapshot = await getDocs(invitesQuery)
      for (const inviteDoc of invitesSnapshot.docs) {
        await deleteDoc(doc(db, 'shareInvites', inviteDoc.id))
      }

      // Verwijder de share zelf
      await deleteDoc(doc(db, 'shares', shareId))
      return true
    } catch (err) {
      console.error('Error deleting share:', err)
      setError(err instanceof Error ? err.message : 'Fout bij verwijderen share')
      return false
    }
  }, [userId])

  // ========================================
  // Haal share info op (voor display)
  // ========================================
  const getShareInfo = useCallback(async (layoutId: string): Promise<Share | null> => {
    if (!userId) return null

    try {
      const sharesQuery = query(
        collection(db, 'shares'),
        where('ownerId', '==', userId),
        where('layoutId', '==', layoutId)
      )
      const snapshot = await getDocs(sharesQuery)

      if (snapshot.empty) return null

      const data = snapshot.docs[0].data()
      return {
        id: snapshot.docs[0].id,
        ownerId: data.ownerId,
        ownerEmail: data.ownerEmail,
        ownerName: data.ownerName,
        layoutId: data.layoutId,
        layoutNaam: data.layoutNaam,
        layoutSnapshot: data.layoutSnapshot,
        permission: data.permission,
        sharedWith: data.sharedWith || [],
        shareLink: data.shareLink,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      }
    } catch (err) {
      console.error('Error getting share info:', err)
      return null
    }
  }, [userId])

  // ========================================
  // Update layout snapshot in share (sync)
  // ========================================
  const syncLayoutToShare = useCallback(async (layout: Layout): Promise<void> => {
    if (!userId) return

    try {
      const sharesQuery = query(
        collection(db, 'shares'),
        where('ownerId', '==', userId),
        where('layoutId', '==', layout.id)
      )
      const snapshot = await getDocs(sharesQuery)

      if (!snapshot.empty) {
        const shareId = snapshot.docs[0].id
        await updateDoc(doc(db, 'shares', shareId), {
          layoutSnapshot: layout,
          layoutNaam: layout.naam,
          updatedAt: serverTimestamp()
        })
      }
    } catch (err) {
      console.error('Error syncing layout to share:', err)
    }
  }, [userId])

  return {
    sharing,
    error,
    pendingInvites,

    // Share acties
    createShareLink,
    inviteByEmail,
    acceptShareByToken,
    removeUserFromShare,
    revokeShareLink,
    deleteShare,

    // Helpers
    getShareInfo,
    syncLayoutToShare
  }
}
