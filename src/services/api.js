// ─────────────────────────────────────────────────────────────
// MOCK API — replaces all real backend calls with local data
// Switch MOCK_MODE to false and uncomment the real `request`
// function below when you connect a real backend.
// ─────────────────────────────────────────────────────────────
'use client'

import {
  MOCK_USER, MOCK_PODS, MOCK_DEALS, MOCK_NOTIFICATIONS,
  MOCK_LEADERBOARD, MOCK_POP_RECORDS,
  MOCK_PROJECT, MOCK_PROJECT_JOBS, MOCK_PREMIUM_CONFIG,
} from '@/lib/mockData'

const MOCK_MODE = true   // ← set false to use real backend

// Simulate a short network delay so loading states show properly
function delay(ms = 280) { return new Promise(r => setTimeout(r, ms)) }
function ok(data) { return { data, error: null } }
function err(msg) { return { data: null, error: msg } }

// ─── Real request (used when MOCK_MODE = false) ───────────────
function getToken() {
  if (typeof window === 'undefined') return null
  try { return sessionStorage.getItem('w3l_user_token') } catch { return null }
}
async function request(method, path, body) {
  try {
    const token = getToken()
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? '/api'}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      return { data: null, error: e.message ?? `HTTP ${res.status}` }
    }
    return { data: await res.json(), error: null }
  } catch (e) {
    return { data: null, error: e.message ?? 'Network error' }
  }
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────
export async function userLogin({ email, password }) {
  if (!MOCK_MODE) return request('POST', '/user/login', { email, password })
  await delay(400)
  // Accept any credentials in demo mode
  const token = 'mock_token_' + Date.now()
  try { sessionStorage.setItem('w3l_user_token', token) } catch {}
  // Set cookie so middleware passes
  document.cookie = `w3l_user_auth=${token}; path=/; max-age=86400`
  return ok({ token, user: MOCK_USER })
}

export async function userLoginWithWallet({ walletAddress, chain, signature, message }) {
  if (!MOCK_MODE) return request('POST', '/user/login/wallet', { walletAddress, chain, signature, message })
  await delay(400)
  const token = 'mock_token_wallet_' + Date.now()
  try { sessionStorage.setItem('w3l_user_token', token) } catch {}
  document.cookie = `w3l_user_auth=${token}; path=/; max-age=86400`
  return ok({ token, user: { ...MOCK_USER, baseWallet: walletAddress } })
}

export async function userLogout() {
  if (!MOCK_MODE) return request('POST', '/user/logout')
  await delay(100)
  try { sessionStorage.removeItem('w3l_user_token') } catch {}
  return ok({})
}

export async function userForgotPassword({ email }) {
  if (!MOCK_MODE) return request('POST', '/user/forgot-password', { email })
  await delay(600)
  return ok({ message: 'Reset link sent (demo — no email actually sent)' })
}

export async function userResetPassword({ token, password }) {
  if (!MOCK_MODE) return request('POST', '/user/reset-password', { token, password })
  await delay(500)
  return ok({ message: 'Password updated' })
}

export async function validateInviteToken(token) {
  if (!MOCK_MODE) return request('GET', `/user/accept-invite?token=${encodeURIComponent(token)}`)
  await delay(300)
  return ok({ valid: true, role: 'Smart Contract Dev', podName: 'DeFi Builders' })
}

export async function registerWithInvite(body) {
  if (!MOCK_MODE) return request('POST', '/user/accept-invite', body)
  await delay(500)
  const token = 'mock_token_' + Date.now()
  document.cookie = `w3l_user_auth=${token}; path=/; max-age=86400`
  return ok({ token, user: MOCK_USER })
}

// ─────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────
export async function fetchProfile() {
  if (!MOCK_MODE) return request('GET', '/user/profile')
  await delay()
  return ok(MOCK_USER)
}

export async function fetchPublicProfile(username) {
  if (!MOCK_MODE) return request('GET', `/u/${username}`)
  await delay()
  const found = MOCK_LEADERBOARD.find(u => u.username === username) ?? MOCK_USER
  const allPopRecords = MOCK_PODS
    .filter(p => p.popRecords?.length)
    .flatMap(p => (p.popRecords ?? []).map(r => ({ ...r, podName: p.name })))
  return ok({
    ...MOCK_USER, ...found,
    pods: MOCK_PODS.slice(0, 2),
    popRecords: allPopRecords,
    totalPops: allPopRecords.length || MOCK_USER.totalPops,
  })
}

export async function updateProfile(body) {
  if (!MOCK_MODE) return request('PATCH', '/user/profile', body)
  await delay(500)
  Object.assign(MOCK_USER, body)
  return ok(MOCK_USER)
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
export async function fetchDashboardSummary() {
  if (!MOCK_MODE) return request('GET', '/user/dashboard')
  await delay()
  return ok({
    totalEarningsUsd: MOCK_USER.totalEarningsUsd,
    reputationScore:  MOCK_USER.reputationScore,
    totalPops:        MOCK_USER.totalPops,
    activePodCount:   MOCK_PODS.filter(p => p.status === 'active').length,
  })
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
let _notifications = [...MOCK_NOTIFICATIONS]

export async function fetchNotifications({ page = 1, unreadOnly = false } = {}) {
  if (!MOCK_MODE) return request('GET', `/user/notifications?page=${page}&unreadOnly=${unreadOnly}`)
  await delay()
  const list = unreadOnly ? _notifications.filter(n => !n.read) : _notifications
  return ok({ notifications: list, total: list.length })
}

export async function markNotificationRead(id) {
  if (!MOCK_MODE) return request('PATCH', `/user/notifications/${id}/read`)
  await delay(150)
  _notifications = _notifications.map(n => n.id === id ? { ...n, read: true } : n)
  return ok({})
}

export async function markAllNotificationsRead() {
  if (!MOCK_MODE) return request('PATCH', '/user/notifications/read-all')
  await delay(200)
  _notifications = _notifications.map(n => ({ ...n, read: true }))
  return ok({})
}

// ─────────────────────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────────────────────
export async function fetchLeaderboard({ period = 'alltime', page = 1 } = {}) {
  if (!MOCK_MODE) return request('GET', `/leaderboard?period=${period}&page=${page}`)
  await delay()
  // Map mock data fields to match what LeaderboardClient expects
  const mapped = MOCK_LEADERBOARD.map(u => ({
    ...u,
    userId: u.id,
    earningsUsd: u.earned,
  }))
  return ok({ entries: mapped, leaders: mapped, total: mapped.length })
}

// ─────────────────────────────────────────────────────────────
// PODS
// ─────────────────────────────────────────────────────────────
let _pods = [...MOCK_PODS]

export async function fetchMyPods() {
  if (!MOCK_MODE) return request('GET', '/user/pods')
  await delay()
  return ok({ pods: _pods })
}

export async function fetchPod(podId) {
  if (!MOCK_MODE) return request('GET', `/user/pods/${podId}`)
  await delay()
  const pod = _pods.find(p => p.id === podId) ?? _pods[0]
  // Add podPopRecord summary for completed pods
  const podPopRecord = pod.status === 'completed' ? {
    jobsCompleted: pod.deals?.filter(d => d.status === 'completed').length ?? 0,
    avgScore: pod.popRecords?.length
      ? Math.round(pod.popRecords.reduce((a, r) => a + (r.score ?? 0), 0) / pod.popRecords.length)
      : null,
  } : null
  return ok({ ...pod, podPopRecord })
}

export async function createPod(body) {
  if (!MOCK_MODE) return request('POST', '/user/pods', body)
  await delay(600)
  const newPod = {
    id: 'pod_' + Date.now(),
    ...body,
    status: 'forming',
    myRole: 'admin',
    memberCount: 1,
    reputationScore: null,
    popCount: 0,
    earningsUsd: 0,
    members: [{ id: MOCK_USER.id, displayName: MOCK_USER.displayName, role: body.roles?.[0] ?? 'Admin', isAdmin: true, reputationScore: MOCK_USER.reputationScore, popCount: MOCK_USER.totalPops }],
    projectAssigned: false,
    createdAt: new Date().toISOString(),
    deals: [],
  }
  _pods = [newPod, ..._pods]
  return ok(newPod)
}

export async function updatePod(podId, body) {
  if (!MOCK_MODE) return request('PATCH', `/user/pods/${podId}`, body)
  await delay(400)
  _pods = _pods.map(p => p.id === podId ? { ...p, ...body } : p)
  return ok(_pods.find(p => p.id === podId))
}

export async function removeMember(podId, memberId) {
  if (!MOCK_MODE) return request('DELETE', `/user/pods/${podId}/members/${memberId}`)
  await delay(300)
  _pods = _pods.map(p => p.id === podId
    ? { ...p, members: p.members.filter(m => m.id !== memberId), memberCount: p.memberCount - 1 }
    : p)
  return ok({})
}

export async function dissolvePod(podId) {
  if (!MOCK_MODE) return request('DELETE', `/user/pods/${podId}`)
  await delay(600)
  _pods = _pods.map(p => p.id === podId ? { ...p, status: 'dissolved' } : p)
  return ok({})
}

export async function generatePodInviteLink(podId, { role }) {
  if (!MOCK_MODE) return request('POST', `/user/pods/${podId}/invite`, { role })
  await delay(300)
  return ok({ inviteUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/join?token=mock_invite_${podId}_${Date.now()}` })
}

export async function fetchPodApplications(podId) {
  if (!MOCK_MODE) return request('GET', `/user/pods/${podId}/applications`)
  await delay()
  return ok({ applications: [] })
}

export async function acceptPodApplication(podId, applicationId) {
  if (!MOCK_MODE) return request('POST', `/user/pods/${podId}/applications/${applicationId}/accept`)
  await delay(300)
  return ok({})
}

export async function rejectPodApplication(podId, applicationId) {
  if (!MOCK_MODE) return request('POST', `/user/pods/${podId}/applications/${applicationId}/reject`)
  await delay(300)
  return ok({})
}

export async function applyToPod({ inviteToken }) {
  if (!MOCK_MODE) return request('POST', '/user/pods/apply', { inviteToken })
  await delay(500)
  return ok({ message: 'Application submitted' })
}

// Pod chat
export async function fetchSplitChat(podId) {
  if (!MOCK_MODE) return request('GET', `/user/pods/${podId}/chat`)
  await delay()
  return ok({ messages: [
    { senderName: 'Sarah Park',  text: 'Hey team, let\'s sync on the audit scope tomorrow.',    sentAt: new Date(Date.now()-1000*60*60*3).toISOString(), isOwn: false },
    { senderName: 'Mike Torres', text: 'Designs are 80% done. Will share Figma link EOD.',      sentAt: new Date(Date.now()-1000*60*60*1).toISOString(), isOwn: false },
    { senderName: 'Alex Chen',   text: 'Great progress everyone. Stand-up at 10am tomorrow?',   sentAt: new Date(Date.now()-1000*60*20).toISOString(),  isOwn: true  },
  ]})
}

export async function sendSplitMessage(podId, { text }) {
  if (!MOCK_MODE) return request('POST', `/user/pods/${podId}/chat`, { text })
  await delay(200)
  return ok({ message: { senderName: MOCK_USER.displayName, text, sentAt: new Date().toISOString(), isOwn: true } })
}

// Work completion + claiming
export async function notifyWorkComplete(podId) {
  if (!MOCK_MODE) return request('POST', `/user/pods/${podId}/notify-complete`)
  await delay(500)
  _pods = _pods.map(p => p.id === podId ? { ...p, status: 'submitted' } : p)
  return ok({ status: 'submitted' })
}

export async function claimSplit(podId) {
  if (!MOCK_MODE) return request('POST', `/user/pods/${podId}/claim`)
  await delay(800)
  _pods = _pods.map(p => p.id === podId ? { ...p, status: 'completed' } : p)
  return ok({ txHash: '0xmockTxHash' + Date.now(), amount: 2250 })
}

export async function exportPoPCV(podId) {
  if (!MOCK_MODE) return request('POST', `/user/pods/${podId}/pop/export`)
  await delay(600)
  return ok({ url: 'https://pop.work3labs.io/mock/cv-pod-' + podId })
}

// ─────────────────────────────────────────────────────────────
// MARKETPLACE
// ─────────────────────────────────────────────────────────────
export async function fetchMarketplaceJobs({ category, chain, type, page = 1, q } = {}) {
  if (!MOCK_MODE) {
    const params = new URLSearchParams({ page })
    if (category) params.set('category', category)
    if (chain) params.set('chain', chain)
    if (type) params.set('type', type)
    if (q) params.set('q', q)
    return request('GET', `/marketplace?${params}`)
  }
  await delay()
  let jobs = [...MOCK_DEALS]
  if (category && category !== 'All') jobs = jobs.filter(j => j.category === category)
  if (chain && chain !== 'all')       jobs = jobs.filter(j => j.chain === chain)
  if (type && type !== 'both')        jobs = jobs.filter(j => j.requiredType === type || j.requiredType === 'both')
  if (q)                              jobs = jobs.filter(j => j.title.toLowerCase().includes(q.toLowerCase()) || j.description.toLowerCase().includes(q.toLowerCase()))
  return ok({ jobs, total: jobs.length })
}

export async function fetchMarketplaceJob(jobId) {
  if (!MOCK_MODE) return request('GET', `/marketplace/${jobId}`)
  await delay()
  const job = MOCK_DEALS.find(j => j.id === jobId) ?? MOCK_DEALS[0]
  return ok(job)
}

export async function applyToMarketplaceJob(jobId, { coverNote, applyAs }) {
  if (!MOCK_MODE) return request('POST', `/marketplace/${jobId}/apply`, { coverNote, applyAs })
  await delay(600)
  return ok({ message: 'Application submitted', applicationId: 'app_' + Date.now() })
}

export async function fetchMyApplications() {
  if (!MOCK_MODE) return request('GET', '/user/applications')
  await delay()
  return ok({ applications: MOCK_DEALS.filter(d => d.myStatus).map(d => ({ ...d, status: d.myStatus })) })
}

// Job chat (post-acceptance)
export async function fetchJobChat(jobId) {
  if (!MOCK_MODE) return request('GET', `/jobs/${jobId}/chat`)
  await delay()
  return ok({ messages: [
    { senderName: 'BaseSwap Protocol', text: 'Hi Alex! Excited to work together. Can you share a rough timeline breakdown?', sentAt: new Date(Date.now()-1000*60*60*2).toISOString(), isOwn: false },
    { senderName: 'Alex Chen',         text: 'Absolutely! Week 1-2: wireframes. Week 3-5: development. Week 6: testing + handoff.', sentAt: new Date(Date.now()-1000*60*30).toISOString(), isOwn: true },
  ]})
}

export async function sendJobChatMessage(jobId, { text }) {
  if (!MOCK_MODE) return request('POST', `/jobs/${jobId}/chat`, { text })
  await delay(200)
  return ok({})
}

export async function submitDeliverable(jobId, { description, links }) {
  if (!MOCK_MODE) return request('POST', `/jobs/${jobId}/submit`, { description, links })
  await delay(600)
  return ok({ status: 'submitted' })
}

export async function verifyAndRelease(jobId) {
  if (!MOCK_MODE) return request('POST', `/jobs/${jobId}/verify`)
  await delay(800)
  return ok({ txHash: '0xmockRelease' + Date.now() })
}

export async function raiseDispute(jobId, { reason }) {
  if (!MOCK_MODE) return request('POST', `/jobs/${jobId}/dispute`, { reason })
  await delay(500)
  return ok({ disputeId: 'disp_' + Date.now() })
}

// ─────────────────────────────────────────────────────────────
// POP RECORDS
// ─────────────────────────────────────────────────────────────
export async function fetchUserRatings(username) {
  if (!MOCK_MODE) return request('GET', `/u/${username}/ratings`)
  await delay()
  return ok({ ratings: [
    { id: 'r1', stars: 5, feedback: 'Exceptional quality. Delivered ahead of schedule.', authorUsername: 'baseswap_protocol', fromName: 'OmniLink Protocol', createdAt: '2025-11-15T00:00:00Z' },
    { id: 'r2', stars: 5, feedback: 'Best smart contract dev we have worked with.',       authorUsername: 'omnilink',           fromName: 'BaseSwap Protocol', createdAt: '2025-10-01T00:00:00Z' },
    { id: 'r3', stars: 4, feedback: 'Great communication. Minor delay on final delivery.', authorUsername: 'metagov_dao',        fromName: 'MetaGov DAO', createdAt: '2025-08-20T00:00:00Z' },
  ]})
}

export async function submitRating({ jobId, targetId, targetType, stars, feedback }) {
  if (!MOCK_MODE) return request('POST', '/user/ratings', { jobId, targetId, targetType, stars, feedback })
  await delay(400)
  return ok({ message: 'Rating submitted' })
}

export async function exportUserPoPCV() {
  if (!MOCK_MODE) return request('POST', '/user/pop/export')
  await delay(700)
  return ok({ url: 'https://pop.work3labs.io/mock/cv-' + MOCK_USER.username })
}

// ─────────────────────────────────────────────────────────────
// PROJECT OWNER
// ─────────────────────────────────────────────────────────────
let _projectJobs = [...MOCK_PROJECT_JOBS]

export async function fetchProjectDashboard() {
  if (!MOCK_MODE) return request('GET', '/project/dashboard')
  await delay()
  return ok(MOCK_PROJECT)
}

export async function fetchProjectJobs() {
  if (!MOCK_MODE) return request('GET', '/project/jobs')
  await delay()
  return ok({ jobs: _projectJobs })
}

export async function createJob(body) {
  if (!MOCK_MODE) return request('POST', '/project/jobs', body)
  await delay(700)
  const newJob = {
    id: 'pjob_' + Date.now(),
    title: body.title,
    category: body.category,
    status: 'open',
    budgetUsd: body.budgetUsd,
    timeline: body.timeline,
    matchType: body.matchType,
    applicantCount: 0,
    deadline: null,
  }
  _projectJobs = [newJob, ..._projectJobs]
  return ok({ ...newJob, jobId: newJob.id })
}

export async function fetchProjectJob(jobId) {
  if (!MOCK_MODE) return request('GET', `/project/jobs/${jobId}`)
  await delay()
  const job = _projectJobs.find(j => j.id === jobId) ?? _projectJobs[0]
  // Enrich with full deal data if available
  const full = MOCK_DEALS.find(d => d.title === job?.title) ?? {}
  return ok({
    ...job, ...full, id: job.id,
    // Ensure fields ProjectJobDetailClient expects
    description: full.description ?? 'No description provided.',
    kpis:        full.kpis ?? [],
    milestones:  full.milestones ?? [],
    chain:       full.chain ?? job.chain ?? 'base',
    requiredType: full.requiredType ?? job.requiredType ?? 'both',
    paymentStructure: full.paymentStructure ?? 'full',
    projectOwner: MOCK_PROJECT,
  })
}

export async function fetchSystemMatches(jobId) {
  if (!MOCK_MODE) return request('GET', `/project/jobs/${jobId}/matches`)
  await delay()
  return ok({ matches: [
    { id: 'match_001', name: 'DeFi Builders', type: 'pod', reputationScore: 91, popCount: 4, matchScore: 96, members: 3, earningsUsd: 8200 },
    { id: 'match_002', name: 'Chain Analytics', type: 'pod', reputationScore: 96, popCount: 5, matchScore: 91, members: 3, earningsUsd: 11800 },
    { id: 'match_003', name: 'Alex Chen', type: 'individual', reputationScore: 94, popCount: 7, matchScore: 88, earningsUsd: 12450 },
  ]})
}

export async function acceptMatch(jobId, matchId) {
  if (!MOCK_MODE) return request('POST', `/project/jobs/${jobId}/matches/${matchId}/accept`)
  await delay(400)
  _projectJobs = _projectJobs.map(j => j.id === jobId ? { ...j, status: 'active' } : j)
  return ok({ status: 'active' })
}

export async function rejectMatch(jobId, matchId) {
  if (!MOCK_MODE) return request('POST', `/project/jobs/${jobId}/matches/${matchId}/reject`)
  await delay(300)
  return ok({})
}

export async function fetchJobApplicants(jobId) {
  if (!MOCK_MODE) return request('GET', `/project/jobs/${jobId}/applicants`)
  await delay()
  return ok({ applicants: [
    { id: 'app_001', applicantName: 'DeFi Builders', type: 'pod',        reputationScore: 91, popCount: 4, coverNote: 'We have delivered 3 similar DEX projects on Base. Portfolio: defibuilders.io', appliedAt: new Date(Date.now()-1000*60*60*6).toISOString(), status: 'accepted' },
    { id: 'app_002', applicantName: 'Alex Chen',     type: 'individual', reputationScore: 94, popCount: 7, coverNote: 'Full-stack Web3 dev with 3 years DeFi experience. Can start immediately.',         appliedAt: new Date(Date.now()-1000*60*60*8).toISOString(), status: 'pending'  },
    { id: 'app_003', applicantName: 'Kaito Nakamura',type: 'individual', reputationScore: 99, popCount: 12,coverNote: 'Top-rated contributor. 24 completed deals. specialising in DEX frontends.',       appliedAt: new Date(Date.now()-1000*60*60*12).toISOString(),status: 'pending'  },
  ]})
}

export async function acceptApplicant(jobId, applicationId) {
  if (!MOCK_MODE) return request('POST', `/project/jobs/${jobId}/applicants/${applicationId}/accept`)
  await delay(400)
  _projectJobs = _projectJobs.map(j => j.id === jobId ? { ...j, status: 'active' } : j)
  return ok({ status: 'active' })
}

export async function fetchProjectJobChat(jobId) {
  if (!MOCK_MODE) return request('GET', `/project/jobs/${jobId}/chat`)
  await delay()
  return ok({ messages: [
    { senderName: 'DeFi Builders', text: 'Hi! Ready to kick off. Can you share the Figma access?', sentAt: new Date(Date.now()-1000*60*60*3).toISOString(), isOwn: false },
    { senderName: 'BaseSwap Protocol', text: 'Sent! Also check the spec doc in notion.',            sentAt: new Date(Date.now()-1000*60*45).toISOString(),  isOwn: true  },
  ]})
}

export async function sendProjectJobChatMessage(jobId, { text }) {
  if (!MOCK_MODE) return request('POST', `/project/jobs/${jobId}/chat`, { text })
  await delay(200)
  return ok({})
}

export async function projectVerifyAndRelease(jobId) {
  if (!MOCK_MODE) return request('POST', `/project/jobs/${jobId}/verify`)
  await delay(800)
  _projectJobs = _projectJobs.map(j => j.id === jobId ? { ...j, status: 'completed' } : j)
  return ok({ txHash: '0xmockVerify' + Date.now() })
}

export async function projectRaiseDispute(jobId, { reason }) {
  if (!MOCK_MODE) return request('POST', `/project/jobs/${jobId}/dispute`, { reason })
  await delay(500)
  return ok({ disputeId: 'disp_proj_' + Date.now() })
}

export async function submitProjectRating({ jobId, targetId, targetType, stars, feedback }) {
  if (!MOCK_MODE) return request('POST', '/project/ratings', { jobId, targetId, targetType, stars, feedback })
  await delay(400)
  return ok({ message: 'Rating submitted' })
}

// Stubs for less common calls
export async function fetchActiveJobs(params = {}) { return fetchMarketplaceJobs(params) }
export async function fetchMyJobs() { return ok({ jobs: [] }) }
export async function applyToJob(jobId, body) { return applyToMarketplaceJob(jobId, body) }
export async function fetchPodChat(podId) { return fetchSplitChat(podId) }
export async function sendPodMessage(podId, body) { return sendSplitMessage(podId, body) }
export async function exportPodPoPCV(podId) { return exportPoPCV(podId) }
export async function fetchActiveJobs2() { return ok({ jobs: [] }) }

// ─────────────────────────────────────────────────────────────
// ADMIN — PREMIUM CONFIG (editable)
// ─────────────────────────────────────────────────────────────

// Persistent premium config in memory (for demo) — replace with DB when using real backend
let _premiumConfig = { ...MOCK_PREMIUM_CONFIG }

export async function fetchPremiumConfig() {
  if (!MOCK_MODE) return request('GET', '/admin/premium/config')
  await delay(200)
  return ok({ tiers: Object.values(_premiumConfig) })
}

export async function updatePremiumTier(tierKey, updates) {
  if (!MOCK_MODE) return request('PUT', `/admin/premium/tiers/${tierKey}`, updates)
  await delay(300)
  if (!_premiumConfig[tierKey]) return err(`Tier '${tierKey}' not found`)
  _premiumConfig[tierKey] = { ..._premiumConfig[tierKey], ...updates }
  return ok({ tier: _premiumConfig[tierKey] })
}

export async function updatePremiumPrice(tierKey, priceUSDC) {
  if (!MOCK_MODE) return request('PATCH', `/admin/premium/tiers/${tierKey}/price`, { price: priceUSDC })
  await delay(250)
  if (!_premiumConfig[tierKey]) return err(`Tier '${tierKey}' not found`)
  _premiumConfig[tierKey].price = priceUSDC
  return ok({ tier: _premiumConfig[tierKey] })
}

export async function updatePremiumPerks(tierKey, perks) {
  if (!MOCK_MODE) return request('PATCH', `/admin/premium/tiers/${tierKey}/perks`, { perks })
  await delay(250)
  if (!_premiumConfig[tierKey]) return err(`Tier '${tierKey}' not found`)
  _premiumConfig[tierKey].perks = perks
  return ok({ tier: _premiumConfig[tierKey] })
}
