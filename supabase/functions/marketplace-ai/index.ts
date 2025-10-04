import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, userId, language = 'en' } = await req.json();
    
    console.log('Marketplace AI request:', { message, sessionId, userId, language });
    
    if (!message) {
      throw new Error('Message is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user context if userId provided
    let userContext = '';
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('username, balance, role')
        .eq('id', userId)
        .single();
      
      if (user) {
        userContext = `User: ${user.username}, Balance: €${user.balance}, Role: ${user.role}`;
      }
    }

    // Build system prompt based on language
    const systemPrompts = {
      en: `You are a helpful AI assistant for a professional marketplace platform. 
      
Key features you can help with:
- Product listings: Users pay a €2.50 listing fee from their balance
- Product reservations: Users can reserve items for €1.00
- Messaging: Users can contact sellers through the platform
- Balance management: Users must maintain at least €1.00 balance
- Product management: Users can edit/delete their own listings

Current user context: ${userContext || 'Guest user'}

Be concise, friendly, and helpful. If users need specific actions (like adding balance, listing a product), guide them to the appropriate section. For complex issues, offer to escalate to support.`,
      lv: `Tu esi palīdzīgs AI asistents profesionālai tirgus platformai.

Galvenās funkcijas, ar kurām vari palīdzēt:
- Produktu saraksti: Lietotāji maksā €2.50 saraksta maksu no sava bilances
- Produktu rezervācijas: Lietotāji var rezervēt preces par €1.00
- Ziņojumapmaiņa: Lietotāji var sazināties ar pārdevējiem caur platformu  
- Bilances pārvaldība: Lietotājiem jāuztur vismaz €1.00 bilance
- Produktu pārvaldība: Lietotāji var rediģēt/dzēst savus sarakstus

Pašreizējais lietotāja konteksts: ${userContext || 'Vieslietotājs'}

Esi kodolīgs, draudzīgs un palīdzīgs. Ja lietotājiem nepieciešamas konkrētas darbības (piemēram, bilances papildināšana, produkta pievienošana), vadi viņus uz atbilstošo sadaļu. Sarežģītām problēmām piedāvā eskalēt uz atbalstu.`
    };

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.en;

    // Analyze message for quick responses
    const messageLower = message.toLowerCase();
    let quickResponse = null;
    
    // Balance-related queries
    if (messageLower.includes('balance') || messageLower.includes('bilance') || 
        messageLower.includes('add money') || messageLower.includes('pievienot naudu')) {
      quickResponse = language === 'lv' 
        ? 'Lai pievienotu līdzekļus savai bilancei, dodieties uz Iestatījumi → Bilance. Minimālais papildinājums ir €1.00. Jums nepieciešama bilance, lai publicētu vai rezervētu produktus.'
        : 'To add funds to your balance, go to Settings → Balance. Minimum deposit is €1.00. You need balance to list or reserve products.';
    }
    
    // Listing fees
    else if (messageLower.includes('listing fee') || messageLower.includes('list product') || 
             messageLower.includes('saraksta maksa') || messageLower.includes('pievienot produktu')) {
      quickResponse = language === 'lv'
        ? 'Produkta publicēšanas maksa ir €2.50. Šī summa tiks automātiski noņemta no jūsu bilances, kad publicēsiet produktu. Pārliecinieties, ka jums ir pietiekami daudz līdzekļu!'
        : 'The product listing fee is €2.50. This will be automatically deducted from your balance when you list a product. Make sure you have enough funds!';
    }
    
    // Reservation
    else if (messageLower.includes('reserve') || messageLower.includes('reservation') ||
             messageLower.includes('rezerv')) {
      quickResponse = language === 'lv'
        ? 'Produkta rezervēšana maksā €1.00. Dodieties uz produkta lapu un noklikšķiniet uz "Rezervēt". Rezervācija garantē, ka produkts tiek noturēts jums.'
        : 'Reserving a product costs €1.00. Go to the product page and click "Reserve". A reservation guarantees the product is held for you.';
    }
    
    // Messaging sellers
    else if (messageLower.includes('message') || messageLower.includes('contact seller') ||
             messageLower.includes('ziņojum') || messageLower.includes('sazinā')) {
      quickResponse = language === 'lv'
        ? 'Lai sazinātos ar pārdevēju, atveriet produktu un noklikšķiniet uz "Sazināties ar pārdevēju". Jūs varat nosūtīt tiešus ziņojumus caur platformu.'
        : 'To contact a seller, open a product and click "Message Seller". You can send direct messages through the platform.';
    }

    let aiResponse = '';
    
    if (quickResponse) {
      aiResponse = quickResponse;
    } else {
      // Use OpenAI for complex queries
      try {
        console.log('Calling OpenAI API...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 400,
            temperature: 0.7,
          }),
        });

        console.log('OpenAI response status:', response.status);

        if (response.status === 429) {
          aiResponse = language === 'lv'
            ? 'Pašlaik ir liels pieprasījums. Lūdzu, mēģiniet vēlreiz pēc brīža.'
            : 'High demand right now. Please try again in a moment.';
        } else if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenAI API error:', response.status, errorText);
          throw new Error(`OpenAI API error: ${response.status}`);
        } else {
          const data = await response.json();
          console.log('OpenAI response received');
          aiResponse = data.choices[0].message.content;
        }
      } catch (error) {
        console.error('OpenAI API error:', error);
        aiResponse = language === 'lv'
          ? 'Es saprotu jūsu jautājumu. Lūdzu, mēģiniet vēlreiz vai sazinieties ar atbalstu.'
          : 'I understand your question. Please try again or contact support.';
      }
    }

    // Store message in database if sessionId provided
    if (sessionId) {
      try {
        await supabase.from('chat_messages').insert([
          {
            session_id: sessionId,
            content: message,
            sender_type: 'user',
            message_type: 'text'
          },
          {
            session_id: sessionId,
            content: aiResponse,
            sender_type: 'bot',
            message_type: 'text'
          }
        ]);
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    console.log('Sending response...');
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        sessionId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in marketplace-ai function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});