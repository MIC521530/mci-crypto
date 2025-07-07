// Admin.jsx - 模擬交易後台 + 餘額功能
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

const coins = ['BTC', 'ETH', 'BNB', 'XRP', 'LTC', 'USDT', 'ADA', 'SOL', 'DOGE', 'DOT'];

export default function Admin({ prices }) {
  const [coin, setCoin] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    // 監聽交易紀錄
    const tradesRef = collection(db, 'users', uid, 'trades');
    const unsub = onSnapshot(tradesRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
    });

    // 取得餘額
    const fetchBalance = async () => {
      const balRef = doc(db, 'users', uid, 'wallet', 'balance');
      const balSnap = await getDoc(balRef);
      if (balSnap.exists()) {
        setBalance(balSnap.data().twd);
      } else {
        // 第一次登入：初始化為 100000
        await setDoc(balRef, { twd: 100000 });
        setBalance(100000);
      }
    };
    fetchBalance();

    return () => unsub();
  }, [auth.currentUser]);

  const handleMockTrade = async (type) => {
    if (!auth.currentUser) {
      setError("請先登入帳號");
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("請輸入有效的數量");
      return;
    }
    if (!prices || !prices[coin.toLowerCase()]) {
      setError("找不到幣價");
      return;
    }

    const priceTWD = prices[coin.toLowerCase()].twd;
    const cost = Number(amount) * priceTWD;
    let newBalance = balance;

    if (type === '買入') {
      if (cost > balance) {
        setError("餘額不足，無法買入");
        return;
      }
      newBalance -= cost;
    } else {
      newBalance += cost;
    }

    // 寫入交易
    const uid = auth.currentUser.uid;
    await addDoc(collection(db, 'users', uid, 'trades'), {
      type,
      coin,
      amount: Number(amount),
      cost,
      price: priceTWD,
      timestamp: serverTimestamp()
    });

    // 更新餘額
    await setDoc(doc(db, 'users', uid, 'wallet', 'balance'), {
      twd: newBalance
    });
    setBalance(newBalance);
    setAmount('');
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-gray-800 rounded-lg shadow text-white">
      <h2 className="text-2xl font-bold mb-2">📊 模擬交易後台</h2>
      <p className="text-green-400 mb-4">💰 餘額：NT${balance.toLocaleString()}</p>

      <label className="block mb-2">選擇幣種</label>
      <select value={coin} onChange={e => setCoin(e.target.value)} className="w-full p-2 mb-4 rounded bg-gray-700">
        {coins.map(c => <option key={c}>{c}</option>)}
      </select>

      <label className="block mb-2">數量</label>
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
      />

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <div className="flex gap-4 mb-6">
        <button onClick={() => handleMockTrade("買入")} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">模擬買入</button>
        <button onClick={() => handleMockTrade("賣出")} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">模擬賣出</button>
      </div>

      <h3 className="text-lg font-semibold mb-2">🧾 即時交易紀錄</h3>
      <ul className="space-y-2 text-sm">
        {logs.map(log => (
          <li key={log.id} className="bg-white/10 p-3 rounded">
            [{new Date(log.timestamp?.seconds * 1000).toLocaleString()}] {log.type} {log.amount} {log.coin} @ NT${log.price.toFixed(2)} = {log.cost.toFixed(0)} 元
          </li>
        ))}
      </ul>
    </div>
  );
}
