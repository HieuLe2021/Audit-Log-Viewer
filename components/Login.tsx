import React, { useState } from 'react';
import { KeyIcon, LoadingSpinnerIcon } from './Icons';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a network request
    setTimeout(() => {
      if (username === 'admin' && password === 'Hello113@') {
        onLoginSuccess();
      } else {
        setError('Invalid username or password.');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary dark:bg-dark-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
           <div className="mx-auto h-16 w-16 text-primary dark:text-dark-primary bg-primary/10 dark:bg-dark-primary/10 p-4 rounded-full flex items-center justify-center">
             <KeyIcon className="h-8 w-8" />
           </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground dark:text-dark-muted-foreground">
            to access the Audit Log Viewer
          </p>
        </div>
        <form 
          className="mt-8 space-y-6 bg-card dark:bg-dark-card p-8 shadow-xl rounded-lg border border-border dark:border-dark-border" 
          onSubmit={handleSubmit}
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-input bg-background px-3 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-ring focus:outline-none focus:ring-ring sm:text-sm dark:border-dark-input dark:bg-dark-background dark:text-dark-foreground dark:placeholder-dark-muted-foreground dark:focus:border-dark-ring dark:focus:ring-dark-ring"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-input" className="sr-only">
                Password
              </label>
              <input
                id="password-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-input bg-background px-3 py-3 text-foreground placeholder-muted-foreground focus:z-10 focus:border-ring focus:outline-none focus:ring-ring sm:text-sm dark:border-dark-input dark:bg-dark-background dark:text-dark-foreground dark:placeholder-dark-muted-foreground dark:focus:border-dark-ring dark:focus:ring-dark-ring"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary py-3 px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-dark-primary dark:text-dark-primary-foreground dark:hover:bg-dark-primary/90 dark:focus:ring-dark-ring dark:ring-offset-dark-background disabled:bg-muted disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinnerIcon className="w-5 h-5 mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;