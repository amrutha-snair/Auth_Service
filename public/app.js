/* ─── Auth Service – Frontend ───────────────────── */
(() => {
    'use strict';

    const API = '/api/auth';
    let accessToken = null;
    let verificationToken = null; // for dev "verify now" shortcut
    let resetToken = null;        // for dev password-reset flow

    /* ── DOM refs ──────────────────────────────────── */
    const $ = (sel) => document.querySelector(sel);
    const pages = {
        login: $('#page-login'),
        signup: $('#page-signup'),
        verify: $('#page-verify'),
        forgot: $('#page-forgot'),
        reset: $('#page-reset'),
        dashboard: $('#page-dashboard'),
    };

    /* ── Navigation ────────────────────────────────── */
    function showPage(name) {
        Object.values(pages).forEach((p) => p.classList.remove('active'));
        const el = pages[name];
        if (el) {
            el.classList.add('active');
            // re-trigger animation
            el.style.animation = 'none';
            el.offsetHeight; // reflow
            el.style.animation = '';
        }
    }

    /* link handlers */
    $('#link-to-signup').addEventListener('click', (e) => { e.preventDefault(); showPage('signup'); });
    $('#link-to-login-from-signup').addEventListener('click', (e) => { e.preventDefault(); showPage('login'); });
    $('#link-to-login-from-verify').addEventListener('click', (e) => { e.preventDefault(); showPage('login'); });
    $('#link-to-login-from-forgot').addEventListener('click', (e) => { e.preventDefault(); showPage('login'); });
    $('#link-forgot').addEventListener('click', (e) => { e.preventDefault(); showPage('forgot'); });

    /* ── Toasts ────────────────────────────────────── */
    function toast(msg, type = 'info') {
        const container = $('#toast-container');
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = msg;
        container.appendChild(el);
        setTimeout(() => { el.classList.add('out'); }, 2800);
        setTimeout(() => { el.remove(); }, 3200);
    }

    /* ── API helpers ───────────────────────────────── */
    async function api(path, opts = {}) {
        const { method = 'POST', body, auth = false } = opts;
        const headers = { 'Content-Type': 'application/json' };
        if (auth && accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

        const res = await fetch(`${API}${path}`, {
            method,
            headers,
            credentials: 'include',
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    }

    /* ── Button loading state ──────────────────────── */
    function setLoading(btn, loading) {
        btn.classList.toggle('loading', loading);
        btn.disabled = loading;
    }

    /* ── Decode JWT expiry ─────────────────────────── */
    function tokenExpiry(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = new Date(payload.exp * 1000);
            return exp.toLocaleTimeString();
        } catch {
            return '—';
        }
    }

    /* ── Enter dashboard ───────────────────────────── */
    function enterDashboard() {
        showPage('dashboard');
        $('#dash-status').textContent = 'Authenticated';
        $('#dash-session').textContent = 'Active';
        $('#dash-expiry').textContent = accessToken ? tokenExpiry(accessToken) : '—';
    }

    /* ══════════════════════════════════════════════════
       SIGNUP
       ══════════════════════════════════════════════════ */
    $('#form-signup').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = $('#btn-signup');
        setLoading(btn, true);

        const name = $('#signup-name').value.trim();
        const email = $('#signup-email').value.trim();
        const password = $('#signup-password').value;

        const { ok, data } = await api('/signup', { body: { name, email, password } });
        setLoading(btn, false);

        if (ok) {
            toast('Account created! Please verify your email.', 'success');
            verificationToken = data.token;
            $('#verify-msg').textContent =
                'We created your account. In production an email would be sent. Click below to verify (dev only).';
            showPage('verify');
            $('#form-signup').reset();
        } else {
            toast(data.message || 'Signup failed', 'error');
        }
    });

    /* ── Dev: instant verify ───────────────────────── */
    $('#btn-verify-now').addEventListener('click', async () => {
        if (!verificationToken) {
            toast('No token available', 'error');
            return;
        }
        const btn = $('#btn-verify-now');
        setLoading(btn, true);
        const res = await fetch(`${API}/verify-email?token=${verificationToken}`, { credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        setLoading(btn, false);

        if (res.ok) {
            toast('Email verified! You can now log in.', 'success');
            verificationToken = null;
            showPage('login');
        } else {
            toast(data.message || 'Verification failed', 'error');
        }
    });

    /* ══════════════════════════════════════════════════
       LOGIN
       ══════════════════════════════════════════════════ */
    $('#form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = $('#btn-login');
        setLoading(btn, true);

        const email = $('#login-email').value.trim();
        const password = $('#login-password').value;

        const { ok, data } = await api('/login', { body: { email, password } });
        setLoading(btn, false);

        if (ok) {
            accessToken = data.accessToken;
            toast('Welcome back!', 'success');
            enterDashboard();
            $('#form-login').reset();
        } else {
            toast(data.message || 'Login failed', 'error');
        }
    });

    /* ══════════════════════════════════════════════════
       FORGOT PASSWORD
       ══════════════════════════════════════════════════ */
    $('#form-forgot').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = $('#btn-forgot');
        setLoading(btn, true);

        const email = $('#forgot-email').value.trim();
        const { ok, data } = await api('/request-password-reset', { body: { email } });
        setLoading(btn, false);

        if (ok) {
            toast('Reset link sent (check response in dev).', 'success');
            if (data.resetToken) {
                resetToken = data.resetToken;
                showPage('reset');
            }
            $('#form-forgot').reset();
        } else {
            toast(data.message || 'Request failed', 'error');
        }
    });

    /* ── Reset Password ────────────────────────────── */
    $('#form-reset').addEventListener('submit', async (e) => {
        e.preventDefault();
        const pw = $('#reset-password').value;
        const confirm = $('#reset-confirm').value;

        if (pw !== confirm) {
            toast('Passwords do not match', 'error');
            return;
        }
        if (!resetToken) {
            toast('No reset token. Request a new one.', 'error');
            return;
        }

        const btn = $('#btn-reset');
        setLoading(btn, true);
        const { ok, data } = await api('/reset-password', { body: { token: resetToken, newPassword: pw } });
        setLoading(btn, false);

        if (ok) {
            toast('Password updated! Sign in with your new password.', 'success');
            resetToken = null;
            showPage('login');
            $('#form-reset').reset();
        } else {
            toast(data.message || 'Reset failed', 'error');
        }
    });

    /* ══════════════════════════════════════════════════
       DASHBOARD ACTIONS
       ══════════════════════════════════════════════════ */

    /* Refresh Token */
    $('#btn-refresh-token').addEventListener('click', async () => {
        const { ok, data } = await api('/refresh');
        if (ok) {
            accessToken = data.accessToken;
            $('#dash-expiry').textContent = tokenExpiry(accessToken);
            toast('Token refreshed', 'success');
        } else {
            toast('Session expired. Please log in again.', 'error');
            accessToken = null;
            showPage('login');
        }
    });

    /* Logout */
    $('#btn-logout').addEventListener('click', async () => {
        await api('/logout');
        accessToken = null;
        toast('Logged out', 'info');
        showPage('login');
    });

    /* ── Init ──────────────────────────────────────── */
    showPage('login');
})();
