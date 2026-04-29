import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import FileDetailPanel from '../components/FileDetailPanel';
import { downloadFile, fetchFileMetadata } from '../services/api';

const classifyErrorState = (message = '') => {
  const normalized = message.toLowerCase();

  if (normalized.includes('revoked')) {
    return {
      badge: 'Revoked',
      title: 'This share link has been revoked',
      description:
        'The file owner has disabled this link, so the file is no longer available through this URL.',
      accent: '#b91c1c',
      background: '#fef2f2',
      border: '#fecaca',
    };
  }

  if (normalized.includes('expired')) {
    return {
      badge: 'Expired',
      title: 'This share link has expired',
      description:
        'This file was shared with a limited lifetime, and the download window has ended.',
      accent: '#92400e',
      background: '#fffbeb',
      border: '#fde68a',
    };
  }

  return {
    badge: 'Invalid Link',
    title: 'File not found',
    description:
      'The file link is invalid, unavailable, or may have been removed.',
    accent: '#475569',
    background: '#f8fafc',
    border: '#cbd5e1',
  };
};

const getExpiryState = (metadata) => {
  if (!metadata) {
    return {
      label: 'Unavailable',
      value: 'Unavailable',
      isExpired: false,
      isPermanent: false,
    };
  }

  const explicitExpired = metadata.isExpired === true;

  if (!metadata.expiresAt) {
    return {
      label: 'No expiration',
      value: 'This file link does not expire',
      isExpired: false,
      isPermanent: true,
    };
  }

  const expiryDate = new Date(metadata.expiresAt);
  const derivedExpired =
    !Number.isNaN(expiryDate.getTime()) && expiryDate.getTime() < Date.now();
  const isExpired = explicitExpired || derivedExpired;

  return {
    label: isExpired ? 'Expired' : 'Active until',
    value: metadata.expiresAt,
    isExpired,
    isPermanent: false,
  };
};

const formatExpiryDate = (value) => {
  if (!value) return 'Unavailable';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
};

const DownloadPage = () => {
  const { token } = useParams();
  const [metadata, setMetadata] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const loadDetails = useCallback(async (activePassword = '') => {
    try {
      setLoading(true);
      const data = await fetchFileMetadata(token, activePassword);
      setMetadata(data);
      setErrorMessage('');
      setRequiresPassword(data.requiresPassword === true);
      setPasswordError('');
    } catch (err) {
      if (err?.status === 401 && err?.data?.requiresPassword === true) {
        setMetadata(null);
        setRequiresPassword(true);
        setPasswordError(err?.message || 'Password required');
        setErrorMessage('');
      } else {
        setMetadata(null);
        setRequiresPassword(false);
        setPasswordError('');
        setErrorMessage(err?.message || 'Request failed');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setMetadata(null);
      setErrorMessage('Missing file token');
      setLoading(false);
      return;
    }

    loadDetails('');
  }, [token, loadDetails]);

  const handleProtectedAccess = async () => {
    await loadDetails(password);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const result = await downloadFile(token, password);
      const objectUrl = window.URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
      setPasswordError('');
    } catch (err) {
      if (err?.status === 401) {
        setRequiresPassword(true);
        setPasswordError(err?.message || 'Password required');
      } else {
        setErrorMessage(err?.message || 'Unable to download file');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.wrapper}>
          <div style={styles.loadingCard}>
            <div style={styles.spinner} />
            <h2 style={styles.loadingTitle}>Loading file details</h2>
            <p style={styles.loadingText}>
              Please wait while we prepare the shared file information.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (errorMessage) {
    const errorState = classifyErrorState(errorMessage);

    return (
      <main style={styles.page}>
        <section style={styles.wrapper}>
          <div
            style={{
              ...styles.errorCard,
              background: errorState.background,
              border: `1px solid ${errorState.border}`,
            }}
          >
            <div
              style={{
                ...styles.errorBadge,
                color: errorState.accent,
                border: `1px solid ${errorState.border}`,
              }}
            >
              {errorState.badge}
            </div>

            <h1 style={styles.errorTitle}>{errorState.title}</h1>
            <p style={styles.errorText}>{errorState.description}</p>

            <div style={styles.errorActionRow}>
              <Link to="/download" style={styles.primaryLinkButton}>
                Find Another File
              </Link>

              <Link to="/" style={styles.secondaryButton}>
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const expiry = getExpiryState(metadata);
  const displayName = metadata?.filename || (requiresPassword ? 'Protected file' : 'Untitled file');

  return (
    <main style={styles.page}>
      <section style={styles.wrapper}>
        <div style={styles.heroCard}>
          <div style={styles.badge}>{requiresPassword ? 'Protected File' : 'Shared File'}</div>

          <h1 style={styles.fileName}>{displayName}</h1>

          <p style={styles.subtitle}>
            {requiresPassword
              ? 'Enter the file password to unlock the share details and complete the download.'
              : 'Review the file details below and download it securely.'}
          </p>

          {requiresPassword && (
            <div style={styles.passwordPanel}>
              <div style={styles.passwordIntro}>
                <span style={styles.passwordBadge}>Password protected</span>
                <p style={styles.passwordCopy}>
                  This shared file is protected. Ask the sender for the password before continuing.
                </p>
              </div>

              <div style={styles.passwordForm}>
                <label htmlFor="share-password" style={styles.passwordLabel}>
                  File password
                </label>
                <input
                  id="share-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter file password"
                  style={styles.passwordInput}
                />
                <button type="button" onClick={handleProtectedAccess} style={styles.unlockButton}>
                  Unlock File
                </button>
              </div>

              {passwordError && <p style={styles.passwordError}>{passwordError}</p>}
            </div>
          )}

          {metadata && (
            <>
              <div
                style={{
                  ...styles.expiryBanner,
                  ...(expiry.isExpired
                    ? styles.expiryBannerExpired
                    : expiry.isPermanent
                    ? styles.expiryBannerPermanent
                    : styles.expiryBannerActive),
                }}
              >
                <span style={styles.expiryBannerLabel}>{expiry.label}</span>
                <span style={styles.expiryBannerValue}>
                  {expiry.isPermanent ? expiry.value : formatExpiryDate(expiry.value)}
                </span>
              </div>

              <FileDetailPanel
                filename={metadata?.filename}
                size={metadata?.size}
                token={token}
                createdAt={metadata?.createdAt}
                expiresAt={metadata?.expiresAt}
                isExpired={expiry.isExpired}
              />
            </>
          )}

          <div style={styles.actionRow}>
            <button
              type="button"
              onClick={handleDownload}
              style={{
                ...styles.primaryButton,
                ...(requiresPassword && !password.trim() ? styles.primaryButtonDisabled : {}),
              }}
              disabled={requiresPassword && !password.trim()}
            >
              {isDownloading ? 'Preparing download...' : 'Download File'}
            </button>

            <Link to="/download" style={styles.secondaryButton}>
              Find Another File
            </Link>
          </div>

          <p style={styles.footerText}>Securely hosted by ShareX</p>
        </div>
      </section>
    </main>
  );
};

const styles = {
  page: {
    background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 45%, #ffffff 100%)',
    minHeight: 'calc(100vh - 110px)',
    padding: '32px 20px 56px',
  },
  wrapper: {
    margin: '0 auto',
    maxWidth: '860px',
  },
  heroCard: {
    background: '#ffffff',
    border: '1px solid #dbeafe',
    borderRadius: '24px',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.10)',
    padding: '32px',
  },
  loadingCard: {
    alignItems: 'center',
    background: '#ffffff',
    border: '1px solid #dbeafe',
    borderRadius: '24px',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '48px 24px',
    textAlign: 'center',
  },
  errorCard: {
    borderRadius: '24px',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
    padding: '32px',
    textAlign: 'center',
  },
  badge: {
    background: '#dbeafe',
    borderRadius: '999px',
    color: '#1d4ed8',
    display: 'inline-block',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    marginBottom: '16px',
    padding: '8px 14px',
    textTransform: 'uppercase',
  },
  errorBadge: {
    background: '#ffffff',
    borderRadius: '999px',
    display: 'inline-block',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    marginBottom: '16px',
    padding: '8px 14px',
    textTransform: 'uppercase',
  },
  fileName: {
    color: '#0f172a',
    fontSize: '2rem',
    lineHeight: 1.2,
    margin: '0 0 12px',
    overflowWrap: 'anywhere',
  },
  subtitle: {
    color: '#475569',
    fontSize: '1rem',
    lineHeight: 1.6,
    margin: '0 0 20px',
  },
  expiryBanner: {
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '24px',
    padding: '16px 18px',
  },
  expiryBannerActive: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
  },
  expiryBannerExpired: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
  },
  expiryBannerPermanent: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
  },
  expiryBannerLabel: {
    fontSize: '0.85rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#475569',
  },
  expiryBannerValue: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#0f172a',
  },
  passwordPanel: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '18px',
    display: 'grid',
    gap: '16px',
    marginBottom: '24px',
    padding: '20px',
  },
  passwordIntro: {
    display: 'grid',
    gap: '8px',
  },
  passwordBadge: {
    color: '#1d4ed8',
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  passwordCopy: {
    color: '#475569',
    lineHeight: 1.6,
    margin: 0,
  },
  passwordForm: {
    alignItems: 'end',
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
  },
  passwordLabel: {
    display: 'block',
    fontWeight: 600,
    gridColumn: '1 / -1',
  },
  passwordInput: {
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    fontSize: '1rem',
    padding: '14px 16px',
  },
  unlockButton: {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    color: '#0f172a',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600,
    padding: '14px 20px',
  },
  passwordError: {
    color: '#b91c1c',
    fontWeight: 500,
    margin: 0,
  },
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
  },
  errorActionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
  },
  primaryButton: {
    background: '#2563eb',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 700,
    padding: '14px 22px',
  },
  primaryButtonDisabled: {
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  primaryLinkButton: {
    background: '#2563eb',
    borderRadius: '12px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '1rem',
    fontWeight: 700,
    padding: '14px 22px',
    textDecoration: 'none',
  },
  secondaryButton: {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    color: '#0f172a',
    display: 'inline-block',
    fontSize: '1rem',
    fontWeight: 600,
    padding: '14px 22px',
    textDecoration: 'none',
  },
  footerText: {
    color: '#64748b',
    fontSize: '0.9rem',
    margin: 0,
  },
  loadingTitle: {
    color: '#0f172a',
    margin: '18px 0 8px',
  },
  loadingText: {
    color: '#475569',
    margin: 0,
    maxWidth: '420px',
  },
  errorTitle: {
    color: '#0f172a',
    margin: '0 0 10px',
  },
  errorText: {
    color: '#475569',
    lineHeight: 1.6,
    margin: '0 0 24px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    border: '4px solid #e2e8f0',
    borderRadius: '50%',
    borderTop: '4px solid #2563eb',
    height: '44px',
    width: '44px',
  },
};

export default DownloadPage;
