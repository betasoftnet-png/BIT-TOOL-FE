import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const authError = searchParams.get('error');

    if (authError) {
      setError(searchParams.get('error_description') || 'Authentication failed');
      return;
    }

    if (!code) {
      setError('No authorization code provided');
      return;
    }

    const exchangeToken = async () => {
      try {
        const AUTH_API_URL = import.meta.env.VITE_AUTH_API_BASE_URL || 'https://api.bnxmail.com/api/oauth';
        
        const response = await fetch(`${AUTH_API_URL}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: 'bit-tool',
            client_secret: 'secure-bit-tool-secret-2026',
            grant_type: 'authorization_code',
            code: code,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange token');
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.access_token) {
          localStorage.setItem('bnx_auth_token', result.data.access_token);
          // Force a full reload to update navbar and any other components
          window.location.href = '/';
        } else {
          throw new Error('Invalid token response');
        }
      } catch (err) {
        console.error('Token exchange error:', err);
        setError('Failed to complete authentication. Please try again.');
      }
    };

    exchangeToken();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <h2 className="text-xl font-semibold text-gray-800">Completing Sign In...</h2>
      <p className="text-gray-500 mt-2">Please wait while we securely log you in.</p>
    </div>
  );
}
