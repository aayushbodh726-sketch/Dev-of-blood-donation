import { withSupabase } from '@supabase/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})

const failure = (error: string, status: number) => json({ success: false, error }, status)

const bloodGroups = new Set(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'])
const roles = new Set(['DONOR', 'RECIPIENT'])
const urgencies = new Set(['CRITICAL', 'HIGH', 'NORMAL'])

const DEFAULT_RESET_REDIRECT = 'https://aayushbodh726-sketch.github.io/Dev-of-blood-donation/#/reset-password'

function mapUser(user: Record<string, any>) {
  return {
    id: user.auth_user_id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    bloodGroup: user.blood_group,
    role: user.role,
    city: user.city,
    state: user.state,
    zipCode: user.zip_code,
    isAvailable: user.is_available,
    lastDonatedDate: user.last_donated_date,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

function mapRequest(request: Record<string, any>) {
  return {
    id: request.id,
    recipientId: request.recipient_id,
    patientName: request.patient_name,
    hospitalName: request.hospital_name,
    hospitalAddr: request.hospital_addr,
    bloodGroup: request.blood_group,
    unitsNeeded: request.units_needed,
    urgency: request.urgency,
    city: request.city,
    state: request.state,
    contactPhone: request.contact_phone,
    status: request.status,
    createdAt: request.created_at,
    updatedAt: request.updated_at,
    ...(request.recipient && {
      recipient: Array.isArray(request.recipient)
        ? request.recipient[0]
        : request.recipient,
    }),
  }
}

function mapDonation(donation: Record<string, any>) {
  return {
    id: donation.id,
    donorId: donation.donor_id,
    requestId: donation.request_id,
    status: donation.status,
    date: donation.date,
    createdAt: donation.created_at,
    updatedAt: donation.updated_at,
    ...(donation.request && { request: mapRequest(donation.request) }),
  }
}

async function currentUser(req: Request, admin: any) {
  const authorization = req.headers.get('authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) return { user: null, profile: null }

  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) return { user: null, profile: null }

  const { data: profile, error: profileError } = await admin
    .from('app_users').select('*').eq('auth_user_id', data.user.id).maybeSingle()
  if (profileError) throw profileError
  return { user: data.user, profile }
}

function validRegister(body: Record<string, any>) {
  return typeof body.name === 'string' && body.name.trim().length >= 2
    && typeof body.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
    && typeof body.password === 'string' && body.password.length >= 6
    && bloodGroups.has(body.bloodGroup) && roles.has(body.role)
    && typeof body.city === 'string' && body.city.trim().length > 0
    && typeof body.state === 'string' && body.state.trim().length > 0
    && (body.phone === undefined || typeof body.phone === 'string')
    && (body.zipCode === undefined || typeof body.zipCode === 'string')
}

function validRequest(body: Record<string, any>) {
  return typeof body.patientName === 'string' && body.patientName.trim().length > 0
    && typeof body.hospitalName === 'string' && body.hospitalName.trim().length > 0
    && (body.hospitalAddr === undefined || typeof body.hospitalAddr === 'string')
    && bloodGroups.has(body.bloodGroup)
    && Number.isInteger(body.unitsNeeded) && body.unitsNeeded > 0
    && urgencies.has(body.urgency)
    && typeof body.city === 'string' && body.city.trim().length > 0
    && typeof body.state === 'string' && body.state.trim().length > 0
    && typeof body.contactPhone === 'string' && body.contactPhone.trim().length > 0
}

function requestData(body: Record<string, any>, recipientId: string) {
  return {
    recipient_id: recipientId,
    patient_name: body.patientName.trim(),
    hospital_name: body.hospitalName.trim(),
    hospital_addr: body.hospitalAddr || null,
    blood_group: body.bloodGroup,
    units_needed: body.unitsNeeded,
    urgency: body.urgency,
    city: body.city.trim(),
    state: body.state.trim(),
    contact_phone: body.contactPhone.trim(),
  }
}

function isSafeRedirect(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false
    const host = parsed.hostname
    return (
      host === 'localhost'
      || host === '127.0.0.1'
      || host.endsWith('.github.io')
      || host.endsWith('.supabase.co')
    )
  } catch {
    return false
  }
}

async function handle(req: Request, admin: any) {
  const url = new URL(req.url)
  const marker = '/lifeflow-api'
  const markerAt = url.pathname.indexOf(marker)
  const path = markerAt >= 0 ? (url.pathname.slice(markerAt + marker.length) || '/') : url.pathname
  const method = req.method

  if (method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (method === 'GET' && path === '/stats') {
    const [donors, lives, requests] = await Promise.all([
      admin.from('app_users').select('auth_user_id', { count: 'exact', head: true }).eq('role', 'DONOR'),
      admin.from('donation_history').select('id', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
      admin.from('blood_requests').select('id', { count: 'exact', head: true }).eq('status', 'OPEN'),
    ])
    const error = donors.error || lives.error || requests.error
    if (error) throw error
    return json({ success: true, data: { totalDonors: donors.count || 0, livesSaved: lives.count || 0, activeRequests: requests.count || 0 } })
  }

  if (method === 'POST' && path === '/auth/register') {
    const body = await req.json()
    if (!validRegister(body)) return failure('Invalid registration details', 400)
    const email = body.email.trim().toLowerCase()
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: { name: body.name.trim() },
    })
    if (createError || !created.user) {
      const duplicate = /already|registered|exists/i.test(createError?.message || '')
      return failure(duplicate ? 'Email already registered' : 'Could not create account', duplicate ? 409 : 400)
    }

    const { data: profile, error: profileError } = await admin.from('app_users').insert({
      auth_user_id: created.user.id,
      name: body.name.trim(),
      email,
      phone: body.phone || null,
      blood_group: body.bloodGroup,
      role: body.role,
      city: body.city.trim(),
      state: body.state.trim(),
      zip_code: body.zipCode || null,
    }).select('*').single()
    if (profileError || !profile) {
      await admin.auth.admin.deleteUser(created.user.id)
      console.error('Profile creation failed', profileError)
      return failure('Could not create account profile', 500)
    }

    const { data: session, error: sessionError } = await admin.auth.signInWithPassword({ email, password: body.password })
    if (sessionError || !session.session) return failure('Account created, but sign-in failed. Please log in.', 500)
    return json({ success: true, data: { token: session.session.access_token, refreshToken: session.session.refresh_token, user: mapUser(profile) } }, 201)
  }

  if (method === 'POST' && path === '/auth/login') {
    const body = await req.json()
    if (typeof body.email !== 'string' || typeof body.password !== 'string') return failure('Invalid email or password', 400)
    const { data, error } = await admin.auth.signInWithPassword({ email: body.email.trim().toLowerCase(), password: body.password })
    if (error || !data.user || !data.session) return failure('Invalid email or password', 401)
    const { data: profile, error: profileError } = await admin.from('app_users').select('*').eq('auth_user_id', data.user.id).maybeSingle()
    if (profileError || !profile) return failure('Invalid email or password', 401)
    return json({ success: true, data: { token: data.session.access_token, refreshToken: data.session.refresh_token, user: mapUser(profile) } })
  }

  if (method === 'POST' && path === '/auth/refresh') {
    const body = await req.json()
    if (typeof body.refreshToken !== 'string' || !body.refreshToken) return failure('Invalid refresh token.', 401)
    const { data, error } = await admin.auth.refreshSession({ refresh_token: body.refreshToken })
    if (error || !data.session || !data.user) return failure('Session expired. Please log in again.', 401)
    const { data: profile, error: profileError } = await admin.from('app_users').select('*').eq('auth_user_id', data.user.id).maybeSingle()
    if (profileError || !profile) return failure('Invalid session.', 401)
    return json({ success: true, data: { token: data.session.access_token, refreshToken: data.session.refresh_token, user: mapUser(profile) } })
  }

  // Request a password-reset email (always returns the same success message for privacy)
  if (method === 'POST' && path === '/auth/forgot-password') {
    const body = await req.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return failure('Please enter a valid email address', 400)
    }

    let redirectTo = typeof body.redirectTo === 'string' ? body.redirectTo.trim() : DEFAULT_RESET_REDIRECT
    if (!isSafeRedirect(redirectTo)) redirectTo = DEFAULT_RESET_REDIRECT

    // Only attempt send when the email is registered; still return a generic success response.
    const { data: profile } = await admin.from('app_users').select('auth_user_id').eq('email', email).maybeSingle()
    if (profile) {
      const { error } = await admin.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) {
        console.error('resetPasswordForEmail failed', error)
        // Fall back to generating a recovery link (email may still be sent by Supabase templates)
        const { error: linkError } = await admin.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: { redirectTo },
        })
        if (linkError) {
          console.error('generateLink recovery failed', linkError)
          return failure('Could not send reset email. Please try again later.', 500)
        }
      }
    }

    return json({
      success: true,
      message: 'If an account exists for that email, a password reset link has been sent. Please check your inbox and spam folder.',
    })
  }

  // Set a new password using the recovery access token from the email link
  if (method === 'POST' && path === '/auth/reset-password') {
    const body = await req.json().catch(() => ({}))
    const password = typeof body.password === 'string' ? body.password : ''
    if (password.length < 6) return failure('Password must be at least 6 characters', 400)

    const authorization = req.headers.get('authorization') || ''
    const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : (typeof body.accessToken === 'string' ? body.accessToken : '')
    if (!accessToken) return failure('Invalid or expired reset link. Please request a new one.', 401)

    const { data: userData, error: userError } = await admin.auth.getUser(accessToken)
    if (userError || !userData.user) {
      return failure('Invalid or expired reset link. Please request a new one.', 401)
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(userData.user.id, { password })
    if (updateError) {
      console.error('Password update failed', updateError)
      return failure(updateError.message || 'Could not update password', 400)
    }

    return json({
      success: true,
      message: 'Your password has been updated. You can now sign in with your new password.',
    })
  }

  if (method === 'GET' && path === '/donors/search') {
    const bloodGroup = url.searchParams.get('bloodGroup')
    const city = (url.searchParams.get('city') || '').trim().toLocaleLowerCase()
    let query = admin.from('app_users').select('*').eq('role', 'DONOR').eq('is_available', true)
    if (bloodGroup) query = query.eq('blood_group', bloodGroup)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    const donors = (data || []).filter((donor) => !city || donor.city.toLocaleLowerCase().includes(city)).map(mapUser)
    return json({ success: true, count: donors.length, data: donors })
  }

  if (method === 'GET' && path === '/requests') {
    const status = url.searchParams.get('status') || 'OPEN'
    const { data, error } = await admin.from('blood_requests')
      .select('*, recipient:app_users!blood_requests_recipient_id_fkey(name,email)')
      .eq('status', status).order('created_at', { ascending: false })
    if (error) throw error
    const urgencyOrder: Record<string, number> = { CRITICAL: 1, HIGH: 2, NORMAL: 3 }
    const results = (data || []).sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
    return json({ success: true, data: results.map(mapRequest) })
  }

  const pledgeMatch = path.match(/^\/requests\/([^/]+)\/pledge$/)
  if (method === 'POST' && pledgeMatch) {
    const { user, profile } = await currentUser(req, admin)
    if (!user || !profile) return failure('Access denied. No valid token provided.', 401)
    if (profile.role !== 'DONOR') return failure('Only donors can pledge to blood requests', 403)
    const { data: request, error: requestError } = await admin.from('blood_requests').select('*').eq('id', pledgeMatch[1]).maybeSingle()
    if (requestError) throw requestError
    if (!request) return failure('Blood request not found', 404)
    if (request.status !== 'OPEN') return failure('This request is no longer open', 400)
    const { data: existing, error: existingError } = await admin.from('donation_history').select('id').eq('donor_id', user.id).eq('request_id', request.id).maybeSingle()
    if (existingError) throw existingError
    if (existing) return failure('You have already pledged to this request', 400)
    const { data: donation, error } = await admin.from('donation_history').insert({ donor_id: user.id, request_id: request.id })
      .select('*').single()
    if (error?.code === '23505') return failure('You have already pledged to this request', 400)
    if (error || !donation) throw error || new Error('Could not record pledge')
    return json({ success: true, data: { ...mapDonation(donation), request: mapRequest(request) } }, 201)
  }

  if (method === 'GET' && path === '/auth/me') {
    const { user, profile } = await currentUser(req, admin)
    if (!user || !profile) return failure('Invalid token.', 401)
    return json({ success: true, data: mapUser(profile) })
  }

  if (method === 'PUT' && path === '/donors/availability') {
    const { user, profile } = await currentUser(req, admin)
    if (!user || !profile) return failure('Invalid token.', 401)
    const { data, error } = await admin.from('app_users').update({ is_available: !profile.is_available, updated_at: new Date().toISOString() })
      .eq('auth_user_id', user.id).select('*').single()
    if (error || !data) throw error || new Error('Could not update donor availability')
    return json({ success: true, data: mapUser(data) })
  }

  if (method === 'POST' && path === '/requests') {
    const { user, profile } = await currentUser(req, admin)
    if (!user || !profile) return failure('Access denied. No valid token provided.', 401)
    const body = await req.json()
    if (!validRequest(body)) return failure('Invalid blood request details', 400)
    const { data, error } = await admin.from('blood_requests').insert(requestData(body, user.id)).select('*').single()
    if (error || !data) throw error || new Error('Could not create blood request')
    return json({ success: true, data: mapRequest(data) }, 201)
  }

  return failure('Route not found', 404)
}

Deno.serve(withSupabase({ auth: 'none', cors: { headers: corsHeaders } }, async (req, ctx) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    return await handle(req, ctx.supabaseAdmin)
  } catch (error) {
    console.error('LifeFlow API error', error)
    return failure('Internal Server Error', 500)
  }
}))
