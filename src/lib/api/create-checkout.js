import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});

  try {
    const { userId, credits, price, email } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${credits}% Énergie IAI` },
          unit_amount: Math.round(price * 100), // en centimes
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      success_url: `https://iai-system-project-v3.vercel.app/wallet?success=true`,
      cancel_url: `https://iai-system-project-v3.vercel.app/wallet?canceled=true`,
      metadata: { userId, credits: credits.toString() },
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}