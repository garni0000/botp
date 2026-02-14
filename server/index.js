import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const MONEYFUSION_API_URL = process.env.MONEYFUSION_API_URL || "https://www.pay.moneyfusion.net/pay";
const MONEYFUSION_NOTIF_URL = "https://www.pay.moneyfusion.net/paiementNotif";

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables");
  if (!process.env.VERCEL) process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- Routes ---

// 1. Auth
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà. Essayez de vous connecter.' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@paylock.com';
    const role = (email.toLowerCase() === adminEmail.toLowerCase()) ? 'admin' : 'user';

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ name, email, password, role }])
      .select()
      .single();

    if (error) throw error;

    const { password: _, ...userWithoutPass } = newUser;
    res.json({ user: userWithoutPass, token: `mock-jwt-${newUser.id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@paylock.com';
    const role = (email.toLowerCase() === adminEmail.toLowerCase()) ? 'admin' : 'user';
    const { password: _, ...userWithoutPass } = user;
    userWithoutPass.role = role;
    res.json({ user: userWithoutPass, token: `mock-jwt-${user.id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Content
app.get('/api/content', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map snake_case to camelCase for frontend compatibility
    const mapped = data.map(item => ({
      ...item,
      imageBase64: item.image_base_64,
      mimeType: item.mime_type,
      creatorId: item.creator_id,
      createdAt: new Date(item.created_at).getTime()
    }));
    
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/content/:id', async (req, res) => {
  try {
    const { data: item, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !item) return res.status(404).json({ message: 'Content not found' });

    const mapped = {
      ...item,
      imageBase64: item.image_base_64,
      mimeType: item.mime_type,
      creatorId: item.creator_id,
      createdAt: new Date(item.created_at).getTime()
    };

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/content', async (req, res) => {
  const { title, description, price, currency, imageBase64, mimeType, creatorId } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('content')
      .insert([{
        title,
        description,
        price,
        currency,
        image_base_64: imageBase64,
        mime_type: mimeType,
        creator_id: creatorId
      }])
      .select()
      .single();

    if (error) throw error;
    
    res.json({ ...data, id: data.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Transactions
app.post('/api/transactions', async (req, res) => {
  const { contentId, amount, contentTitle, currency } = req.body;
  
  const netAmount = amount * 0.9;
  const buyerMasked = `User-${Math.floor(Math.random() * 1000)}`;
  const timestamp = Date.now();

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        content_id: contentId,
        content_title: contentTitle,
        amount,
        net_amount: netAmount,
        currency,
        buyer_masked: buyerMasked,
        timestamp
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      ...data,
      id: data.id,
      contentId: data.content_id,
      contentTitle: data.content_title,
      netAmount: data.net_amount,
      buyerMasked: data.buyer_masked,
      timestamp: data.timestamp
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = data.map(tx => ({
      id: tx.id,
      contentId: tx.content_id,
      contentTitle: tx.content_title,
      amount: tx.amount,
      netAmount: tx.net_amount,
      currency: tx.currency,
      timestamp: tx.timestamp || new Date(tx.created_at).getTime(),
      buyerMasked: tx.buyer_masked
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3b. Users list
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3c. Delete content
app.delete('/api/content/:id', async (req, res) => {
  try {
    await supabase.from('transactions').delete().eq('content_id', req.params.id);
    const { error } = await supabase.from('content').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3d. Withdrawals
app.get('/api/withdrawals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = data.map(w => ({
      id: w.id,
      userId: w.user_id,
      userName: w.user_name,
      amount: w.amount,
      currency: w.currency,
      method: w.method,
      accountNumber: w.account_number,
      status: w.status,
      createdAt: new Date(w.created_at).getTime()
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/withdrawals', async (req, res) => {
  const { userId, userName, amount, currency, method, accountNumber } = req.body;

  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .insert([{
        user_id: userId,
        user_name: userName,
        amount,
        currency,
        method,
        account_number: accountNumber,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      accountNumber: data.account_number,
      status: data.status,
      createdAt: new Date(data.created_at).getTime()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/withdrawals/:id/status', async (req, res) => {
  const { status } = req.body;

  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, status: data.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. MoneyFusion Payment
app.post('/api/payment/initiate', async (req, res) => {
  const { totalPrice, title, phone, clientName, contentId } = req.body;

  if (!totalPrice || !phone || !clientName) {
    return res.status(400).json({ message: "Champs requis manquants: totalPrice, phone, clientName" });
  }

  const baseUrl = process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : (req.headers.origin || '');

  const paymentData = {
    totalPrice,
    article: [{ [title || "Contenu Premium"]: totalPrice }],
    personal_Info: [{ contentId }],
    numeroSend: phone,
    nomclient: clientName,
    return_url: req.headers.referer || baseUrl,
    webhook_url: `${baseUrl}/api/payment/webhook`,
  };

  try {
    const response = await axios.post(MONEYFUSION_API_URL, paymentData, {
      headers: { "Content-Type": "application/json" },
    });
    res.json(response.data);
  } catch (error) {
    console.error("MoneyFusion initiate error:", error.message);
    res.status(500).json({ message: error.message || "Erreur lors de l'initiation du paiement" });
  }
});

app.get('/api/payment/status/:token', async (req, res) => {
  try {
    const response = await axios.get(`${MONEYFUSION_NOTIF_URL}/${req.params.token}`);
    res.json(response.data);
  } catch (error) {
    console.error("MoneyFusion status check error:", error.message);
    res.status(500).json({ message: error.message || "Erreur de vérification du paiement" });
  }
});

app.post('/api/payment/webhook', async (req, res) => {
  const { event, tokenPay, personal_Info, Montant, nomclient, numeroSend } = req.body;

  console.log(`[Webhook] Event: ${event}, Token: ${tokenPay}`);

  try {
    if (event === 'payin.session.completed' && personal_Info?.[0]?.contentId) {
      const contentId = personal_Info[0].contentId;

      const { data: existingTx, error: checkError } = await supabase
        .from('transactions')
        .select('id')
        .eq('buyer_masked', `MF-${tokenPay}`)
        .maybeSingle();

      if (existingTx) {
        console.log(`[Webhook] Transaction déjà existante pour ${tokenPay}, ignorée`);
      } else {
        const netAmount = Montant * 0.9;
        const { error: insertError } = await supabase
          .from('transactions')
          .insert([{
            content_id: contentId,
            content_title: `Paiement ${nomclient}`,
            amount: Montant,
            net_amount: netAmount,
            currency: 'XOF',
            buyer_masked: `MF-${tokenPay}`,
            timestamp: Date.now()
          }]);
        if (insertError) {
          console.error(`[Webhook] Insert error:`, insertError.message);
        } else {
          console.log(`[Webhook] Transaction enregistrée pour ${tokenPay}`);
        }
      }
    }
  } catch (error) {
    console.error("[Webhook] Error:", error.message);
  }

  res.status(200).json({ received: true });
});

// Serve frontend in production (non-Vercel)
if (!process.env.VERCEL) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;