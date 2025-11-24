'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { supabase } from '../../../utils/supabase';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';



const AdminDashboard = () => {
  const router = useRouter();
  // Top-level navigation
  const [activeTopTab, setActiveTopTab] = useState('registrations'); // 'registrations', 'messages', 'vote', 'tickets'

  // State for Registrations
  const [usersByStatus, setUsersByStatus] = useState<{
    pending: any[];
    accepted: any[];
    rejected: any[];
  }>({
    pending: [],
    accepted: [],
    rejected: [],
  });
  const [userCounts, setUserCounts] = useState({ pending: 0, accepted: 0, rejected: 0 });
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [activeUserTab, setActiveUserTab] = useState('pending'); // 'pending', 'accepted', 'rejected'

  // State for Messages
  const [messagesByStatus, setMessagesByStatus] = useState<{ unread: any[]; read: any[] }>({ unread: [], read: [] });
  const [messageCounts, setMessageCounts] = useState({ unread: 0, read: 0 });
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [activeMessageTab, setActiveMessageTab] = useState('unread'); // 'unread', 'read'

  // General state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

  const handleApproval = async (userId: string, status: string) => {
    setUpdatingUserId(userId);
    try {
      const { error: updateError } = await supabase
        .from('treat_register')
        .update({ approval_status: status })
        .eq('id', userId);

      if (updateError) throw updateError;

      // To avoid a full re-fetch, we manually move the user in the local state.
      setUsersByStatus((currentUsers) => {
        const userToMove = currentUsers.pending.find((u) => u.id === userId) as any;
        if (!userToMove) return currentUsers; // Should not happen

        // 1. Remove from pending
        const newPending = currentUsers.pending.filter((u) => u.id !== userId);

        // 2. Add to the correct destination (accepted or rejected) and re-create sections
        const destinationKey = status as 'accepted' | 'rejected';
        const flatDestinationUsers = (currentUsers[destinationKey] as any[]).flatMap((section) => section.data);
        const newDestinationUsers = [...flatDestinationUsers, userToMove];

        return {
          ...currentUsers,
          pending: newPending,
          [destinationKey]: createSections(newDestinationUsers),
        };
      });

      setUserCounts((prev) => ({ ...prev, pending: prev.pending - 1, [status]: (prev[status as 'accepted' | 'rejected'] || 0) + 1 }));
    } catch (err) {
      console.error(`Error updating user ${userId} to ${status}:`, err);
      setError(`Failed to update user status. Please try again.`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    setUpdatingMessageId(messageId);
    try {
      const { error: updateError } = await supabase
        .from('message')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (updateError) throw updateError;

      // Optimistic UI update
      setMessagesByStatus((currentMessages) => {
        const messageToMove = currentMessages.unread.find((m) => m.id === messageId) as any;
        if (!messageToMove) return currentMessages;

        return {
          unread: currentMessages.unread.filter((m) => m.id !== messageId),
          read: [messageToMove, ...currentMessages.read], // Add to top of read list
        };
      });

      setMessageCounts((prev) => ({ unread: prev.unread - 1, read: prev.read + 1 }));
    } catch (err) {
      console.error(`Error marking message ${messageId} as read:`, err);
      setError(`Failed to update message status. Please try again.`);
    } finally {
      setUpdatingMessageId(null);
    }
  };
  useEffect(() => {
    const checkSessionAndFetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/admin/login');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch all registered users
        const { data: usersData, error: usersError } = await supabase
          .from('treat_register')
          .select('*')
          .order('created_at', { ascending: true });
        if (usersError) throw usersError;

        // Group users by approval_status
        const pending: any[] = [];
        const accepted: any[] = [];
        const rejected: any[] = [];

        (usersData || []).forEach((user) => {
          // Treat null or undefined status as 'pending'
          const status = user.approval_status || 'pending';
          if (status === 'accepted') {
            accepted.push(user);
          } else if (status === 'rejected') {
            rejected.push(user);
          } else {
            pending.push(user);
          }
        });

        setUserCounts({
          pending: pending.length,
          accepted: accepted.length,
          rejected: rejected.length,
        });

        setUsersByStatus({
          pending: pending, // Pending is a flat list
          accepted: createSections(accepted),
          rejected: createSections(rejected),
        });

        // Fetch contact messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('message')
          .select('*')
          .order('created_at', { ascending: false });
        if (messagesError) throw messagesError;

        // Group messages by status
        const unread: any[] = [];
        const read: any[] = [];
        (messagesData || []).forEach((message) => {
          // Treat null or other values as 'unread'
          if (message.status === 'read') {
            read.push(message);
          } else {
            unread.push(message);
          }
        });

        setMessagesByStatus({ unread, read });
        setMessageCounts({ unread: unread.length, read: read.length });

      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    checkSessionAndFetchData();
  }, [router]);

  // Helper to create sections for SectionList
  const createSections = (userList: any[]) => {
    const groupedByYear = userList.reduce((acc, user) => {
      const year = user.event_year || 'General';
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(user);
      return acc;
    }, {});

    return Object.keys(groupedByYear)
      .sort((a, b) => b.localeCompare(a)) // Sort years descending
      .map((year) => ({
        title: `Event Year ${year}`,
        data: groupedByYear[year].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), // Sort users within year by date
      }));
  };

  const renderUserItem = ({ item, index, isPending = false }: { item: any, index: number, isPending?: boolean }) => (
    <div className={styles.itemContainer}>
      <div className={styles.itemHeader}>
        <h3 className={styles.itemName}>
          {index + 1}. {item.fullName}
        </h3>
        {item.portrait_url && (
          <a href={item.portrait_url} target="_blank" rel="noopener noreferrer">
            <img src={item.portrait_url} alt="Portrait" className={styles.portraitImage} />
          </a>
        )}
      </div>
      <p className={styles.itemDetail}>
        <span className={styles.bold}>Email:</span> {item.email}
      </p>
      <p className={styles.itemDetail}>
        <span className={styles.bold}>WhatsApp:</span> {item.whatsappNumber}
      </p>
      <p className={styles.itemDetail}>
        <span className={styles.bold}>State:</span> {item.state} ({item.lga})
      </p>
      <p className={styles.itemDetail}>
        <span className={styles.bold}>DOB:</span> {item.dob}
      </p>
      {item.age && (
        <p className={styles.itemDetail}>
          <span className={styles.bold}>Age:</span> {item.age}
        </p>
      )}
      <p className={styles.itemDetail}>
        <span className={styles.bold}>Address:</span> {item.address}
      </p>
      {item.instagram && (
        <p className={styles.itemDetail}>
          <span className={styles.bold}>Instagram:</span> {item.instagram}
        </p>
      )}
      {item.tiktok && (
        <p className={styles.itemDetail}>
          <span className={styles.bold}>TikTok:</span> {item.tiktok}
        </p>
      )}
      {item.facebook && (
        <p className={styles.itemDetail}>
          <span className={styles.bold}>Facebook:</span> {item.facebook}
        </p>
      )}
      {item.student && (
        <p className={styles.itemDetail}>
          <span className={styles.bold}>Student:</span> {item.student}
        </p>
      )}
      {item.health && (
        <p className={styles.itemDetail}>
          <span className={styles.bold}>Health:</span> {item.health}
        </p>
      )}
      {item.height && (
        <p className={styles.itemDetail}>
          <span className={styles.bold}>Height:</span> {item.height} ft
        </p>
      )}

      <p className={styles.itemDetail}>
        <span className={styles.bold}>Winner Response:</span> {item.winnerResponse}
      </p>
      {item.addedinfo && (
        <p className={styles.itemDetail}>
          <span className={styles.bold}>Added Info:</span> {item.addedinfo}
        </p>
      )}

      {item.payment_proof_url && (
        <a
          href={item.payment_proof_url}
          className={styles.linkButton}
          target="_blank"
          rel="noopener noreferrer">
          View Payment Proof
        </a>
      )}
      <p className={styles.timestamp}>
        Registered on: {new Date(item.created_at).toLocaleString()}
      </p>

      {isPending && (
        <div className={styles.actionContainer}>
          {updatingUserId === item.id ? (
            <div className={styles.spinner}></div>
          ) : (
            <>
              <button
                className={`${styles.actionButton} ${styles.rejectButton}`}
                onClick={() => handleApproval(item.id, 'rejected')}>
                Reject
              </button>
              <button
                className={`${styles.actionButton} ${styles.acceptButton}`}
                onClick={() => handleApproval(item.id, 'accepted')}>
                Accept
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderMessageItem = ({ item, isUnread = false }: { item: any, isUnread?: boolean }) => (
    <div className={styles.itemContainer}>
      <h3 className={styles.itemName}>{item.name}</h3>
      <p className={styles.itemDetail}>
        <span className={styles.bold}>Email:</span> {item.email}
      </p>
      <p className={styles.messageText}>{item.message}</p>
      <p className={styles.timestamp}>Sent on: {new Date(item.created_at).toLocaleString()}</p>

      {isUnread && (
        <div className={styles.actionContainer}>
          {updatingMessageId === item.id ? (
            <div className={styles.spinner}></div>
          ) : (
            <button
              className={`${styles.actionButton} ${styles.readButton}`}
              onClick={() => handleMarkAsRead(item.id)}>
              Mark as Read
            </button>
          )}
        </div>
      )}
    </div>
  );

  const RegistrationsView = () => {
    const renderRegistrationContent = () => {
      if (activeUserTab === 'pending') {
        return usersByStatus.pending.length > 0 ? (
          usersByStatus.pending.map((item, index) => renderUserItem({ item, index, isPending: true }))
        ) : (
          <p className={styles.emptyText}>No users pending approval.</p>
        );
      }
      if (activeUserTab === 'accepted') {
        return (usersByStatus.accepted as any[]).length > 0 ? (
          (usersByStatus.accepted as any[]).map((section) => (
            <Fragment key={section.title}>
              <h2 className={styles.sectionHeader}>{section.title}</h2>
              {section.data.map((item: any, index: number) => renderUserItem({ item, index }))}
            </Fragment>
          ))
        ) : (
          <p className={styles.emptyText}>No accepted users yet.</p>
        );
      }
      if (activeUserTab === 'rejected') {
        return (usersByStatus.rejected as any[]).length > 0 ? (
          (usersByStatus.rejected as any[]).map((section) => (
            <Fragment key={section.title}>
              <h2 className={styles.sectionHeader}>{section.title}</h2>
              {section.data.map((item: any, index: number) => renderUserItem({ item, index }))}
            </Fragment>
          ))
        ) : (
          <p className={styles.emptyText}>No rejected users yet.</p>
        );
      }
    };

    return (
      <>
        <div className={styles.subTabContainer}>
          <button
            className={`${styles.subTabButton} ${activeUserTab === 'pending' ? styles.activeSubTab : ''}`}
            onClick={() => setActiveUserTab('pending')}>
            Pending ({userCounts.pending})
          </button>
          <button
            className={`${styles.subTabButton} ${activeUserTab === 'accepted' ? styles.activeSubTab : ''}`}
            onClick={() => setActiveUserTab('accepted')}>
            Accepted ({userCounts.accepted})
          </button>
          <button
            className={`${styles.subTabButton} ${activeUserTab === 'rejected' ? styles.activeSubTab : ''}`}
            onClick={() => setActiveUserTab('rejected')}>
            Rejected ({userCounts.rejected})
          </button>
        </div>
        {renderRegistrationContent()}
      </>
    );
  };

  const MessagesView = () => {
    const renderMessageContent = () => {
      if (activeMessageTab === 'unread') {
        return messagesByStatus.unread.length > 0 ? (
          messagesByStatus.unread.map((item) => renderMessageItem({ item, isUnread: true }))
        ) : (
          <p className={styles.emptyText}>No unread messages.</p>
        );
      }
      if (activeMessageTab === 'read') {
        return messagesByStatus.read.length > 0 ? (
          messagesByStatus.read.map((item) => renderMessageItem({ item }))
        ) : (
          <p className={styles.emptyText}>No read messages.</p>
        );
      }
    };

    return (
      <>
        <div className={styles.subTabContainer}>
          <button
            className={`${styles.subTabButton} ${activeMessageTab === 'unread' ? styles.activeSubTab : ''}`}
            onClick={() => setActiveMessageTab('unread')}>
            Unread ({messageCounts.unread})
          </button>
          <button
            className={`${styles.subTabButton} ${activeMessageTab === 'read' ? styles.activeSubTab : ''}`}
            onClick={() => setActiveMessageTab('read')}>
            Read ({messageCounts.read})
          </button>
        </div>
        {renderMessageContent()}
      </>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <div className={styles.spinner}></div>;
    }
    if (error) {
      return <p className={styles.errorText}>Error fetching data: {error}</p>;
    }

    switch (activeTopTab) {
      case 'registrations':
        return <RegistrationsView />;
      case 'messages':
        return <MessagesView />;
      case 'vote':
        return (
          <div>
            <p className={styles.emptyText}>Voting feature coming soon.</p>
          </div>
        );
      case 'tickets':
        return (
          <div>
            <p className={styles.emptyText}>Ticketing feature coming soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className={styles.safeArea}>
      <header className={styles.header}>
        <div style={{ flex: 1 }} />
        <h1 className={styles.title}>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </header>
      <div className={styles.scroll}>
        <div className={styles.tabScrollView}>
          <button
            className={`${styles.tabButton} ${activeTopTab === 'registrations' ? styles.activeTab : ''}`}
            onClick={() => setActiveTopTab('registrations')}>
            Registrations
          </button>
          <button
            className={`${styles.tabButton} ${activeTopTab === 'messages' ? styles.activeTab : ''}`}
            onClick={() => setActiveTopTab('messages')}>
            Messages
          </button>
          <button
            className={`${styles.tabButton} ${activeTopTab === 'vote' ? styles.activeTab : ''}`}
            onClick={() => setActiveTopTab('vote')}>
            Vote
          </button>
          <button
            className={`${styles.tabButton} ${activeTopTab === 'tickets' ? styles.activeTab : ''}`}
            onClick={() => setActiveTopTab('tickets')}>
            Tickets
          </button>
        </div>
      </div>

      <div className={styles.container}>
        {renderContent()}
      </div>
    </main>
  );
};

export default AdminDashboard;