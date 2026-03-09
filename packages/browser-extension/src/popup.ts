import { config } from './config';

const API_URL = config.apiUrl;
const REGION = 'us-east-1';
const CLIENT_ID = '71cq717bep7dgsdi726r5bbkd';

interface CognitoAuthResponse {
  AuthenticationResult: {
    IdToken: string;
    AccessToken: string;
    RefreshToken: string;
    ExpiresIn: number;
  };
}

// Helper to create AWS signature v4 request
function createAwsRequest(target: string, body: string) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': target,
    },
    body: body,
  };
}

// DOM elements
const statusEl = document.getElementById('status') as HTMLDivElement;
const messageEl = document.getElementById('message') as HTMLDivElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;

// Check auth status on load
checkAuthStatus();

// Event listeners
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);

async function checkAuthStatus() {
  const result = await chrome.storage.sync.get(['authToken', 'userEmail']);
  
  if (result.authToken) {
    showConnectedStatus(result.userEmail);
  } else {
    showDisconnectedStatus();
  }
}

function showConnectedStatus(email: string) {
  statusEl.className = 'status connected';
  statusEl.textContent = `✓ Connected as ${email}`;
  
  emailInput.style.display = 'none';
  passwordInput.style.display = 'none';
  emailInput.parentElement!.style.display = 'none';
  passwordInput.parentElement!.style.display = 'none';
  
  loginBtn.style.display = 'none';
  logoutBtn.style.display = 'block';
}

function showDisconnectedStatus() {
  statusEl.className = 'status disconnected';
  statusEl.textContent = '⚠️ Not connected - Please log in';
  
  emailInput.style.display = 'block';
  passwordInput.style.display = 'block';
  emailInput.parentElement!.style.display = 'block';
  passwordInput.parentElement!.style.display = 'block';
  
  loginBtn.style.display = 'block';
  logoutBtn.style.display = 'none';
}

function showMessage(text: string, type: 'success' | 'error') {
  messageEl.className = `message ${type}`;
  messageEl.textContent = text;
  messageEl.style.display = 'block';
  
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}

async function handleLogin() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    showMessage('Please enter both email and password', 'error');
    return;
  }
  
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';
  
  try {
    // Authenticate with Cognito using InitiateAuth
    const cognitoEndpoint = `https://cognito-idp.${REGION}.amazonaws.com/`;
    
    const response = await fetch(cognitoEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      },
      body: JSON.stringify({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Authentication failed');
    }
    
    const data: CognitoAuthResponse = await response.json();
    const token = data.AuthenticationResult.IdToken;
    
    // Store auth token and API URL
    await chrome.storage.sync.set({
      authToken: token,
      userEmail: email,
      apiUrl: API_URL,
    });
    
    // Notify background script that user logged in
    chrome.runtime.sendMessage({ type: 'LOGIN_SUCCESS' });
    
    showMessage('Successfully logged in!', 'success');
    passwordInput.value = '';
    
    setTimeout(() => {
      checkAuthStatus();
    }, 1000);
    
  } catch (error) {
    console.error('Login error:', error);
    showMessage(
      error instanceof Error ? error.message : 'Login failed. Please check your credentials.',
      'error'
    );
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
  }
}

async function handleLogout() {
  await chrome.storage.sync.remove(['authToken', 'userEmail']);
  showMessage('Logged out successfully', 'success');
  
  setTimeout(() => {
    checkAuthStatus();
  }, 1000);
}
