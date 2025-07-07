// src/Login.jsx
import React, { useState } from 'react';
import { auth } from './firebase';
import { db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [wallet, setWallet] = useState('');

  const handleRegister = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setWallet('');
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert("請安裝 MetaMask 擴充套件！");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setWallet(address);

      if (user) {
        const ref = doc(db, "users", user.uid);
        await setDoc(ref, {
          email: user.email,
          wallet: address,
          timestamp: new Date()
        });
        alert("✅ 錢包地址已儲存！");
      }
    } catch (err) {
      console.error(err);
      setError("連接錢包失敗");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">🔐 會員登入/註冊</h2>

      {user ? (
        <div className="text-center space-y-4">
          <p className="text-lg">👤 已登入：{user.email}</p>
          {wallet && <p className="text-sm text-green-400">已連接錢包：{wallet}</p>}
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={connectWallet}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              🔗 連接錢包
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              登出
            </button>
          </div>
        </div>
      ) : (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
          />
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex gap-4">
            <button
              onClick={handleLogin}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
            >
              登入
            </button>
            <button
              onClick={handleRegister}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
            >
              註冊
            </button>
          </div>
        </>
      )}
    </div>
  );
}
