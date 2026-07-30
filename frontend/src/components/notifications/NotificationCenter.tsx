import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

export const NotificationCenter = () => {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const socket = getSocket();
      
      const handleNewNotification = (notif: any) => {
        setNotifications(prev => [notif, ...prev]);
      };
      
      socket.on('new_notification', handleNewNotification);
      return () => { socket.off('new_notification', handleNewNotification); };
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      if (id === 'all') {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } else {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD' && n.read) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setShow(!show)}
        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-india-saffron rounded-full shadow-[0_0_5px_#FF9933]"></span>
        )}
      </button>
      
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 md:w-96 glass-premium border border-white/10 shadow-2xl z-50 overflow-hidden rounded-xl flex flex-col"
            style={{ maxHeight: '80vh' }}
          >
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={() => markAsRead('all')} className="text-xs text-futuristic-cyan hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-xs bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:border-futuristic-cyan"
                  />
                </div>
                <button 
                  onClick={() => setFilter(filter === 'ALL' ? 'UNREAD' : 'ALL')}
                  className={`px-2 py-1 text-xs border rounded-md flex items-center gap-1 transition-colors ${filter === 'UNREAD' ? 'bg-futuristic-cyan/20 border-futuristic-cyan text-futuristic-cyan' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                >
                  <Filter className="w-3 h-3" /> {filter === 'UNREAD' ? 'Unread' : 'All'}
                </button>
              </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">You have no notifications.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredNotifications.map(n => (
                    <div key={n.id} className={`p-4 hover:bg-white/5 transition-colors group relative ${!n.read ? 'bg-futuristic-cyan/5' : ''}`}>
                      {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-futuristic-cyan rounded-r"></div>}
                      
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-semibold ${!n.read ? 'text-white' : 'text-gray-300'}`}>{n.title}</p>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.read && (
                            <button onClick={() => markAsRead(n.id)} className="text-gray-400 hover:text-emerald-400" title="Mark as read">
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button onClick={() => deleteNotification(n.id)} className="text-gray-400 hover:text-red-400" title="Delete">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-xs mb-2 ${!n.read ? 'text-gray-300' : 'text-gray-500'}`}>{n.message}</p>
                      <p className="text-[10px] text-futuristic-cyan">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
