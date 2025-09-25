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
    const { message, sessionId, language = 'en' } = await req.json();
    
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

    // Prepare FAQ responses based on language
    const faqResponses = {
      en: {
        payment: "We accept credit cards, PayPal, and bank transfers. Payment is processed securely through our payment gateway. Your order will be confirmed once payment is received.",
        shipping: "We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free shipping is available for orders over $50. Tracking information will be provided once your order ships.",
        returns: "You can return items within 30 days of purchase. Items must be in original condition. Please contact support to initiate a return. Refunds will be processed within 5-7 business days.",
        account: "You can update your account information in the Settings page. Go to your profile to change your username, email, or password. If you need help, please contact our support team.",
        addProduct: "To add a product, go to the 'Sell' section in the navigation menu. Fill in all required fields including name, price, category, and description. You can also add images and set stock quantity.",
        help: "I understand you need assistance. I can help with common questions about payments, shipping, returns, and account management. If you need more specific help, I can connect you with our support team.",
        escalation: "I'll connect you with a human support agent who can provide more detailed assistance with your inquiry.",
        default: "I'm here to help! I can assist with questions about payments, shipping, returns, account management, and how to use our marketplace. What would you like to know?"
      },
      lv: {
        payment: "Mēs pieņemam kredītkartes, PayPal un bankas pārskaitījumus. Maksājumi tiek apstrādāti droši caur mūsu maksājumu vārteju. Jūsu pasūtījums tiks apstiprināts pēc maksājuma saņemšanas.",
        shipping: "Mēs piedāvājam standarta piegādi (5-7 darba dienas) un ātrās piegādes (2-3 darba dienas). Bezmaksas piegāde pieejama pasūtījumiem virs 50 €. Izsekošanas informācija tiks sniegta pēc pasūtījuma nosūtīšanas.",
        returns: "Jūs varat atgriezt preces 30 dienu laikā pēc pirkuma. Precēm jābūt oriģinālā stāvoklī. Lūdzu, sazinieties ar atbalsta komandu, lai uzsāktu atgriešanu. Atmaksa tiks apstrādāta 5-7 darba dienu laikā.",
        account: "Jūs varat atjaunināt sava konta informāciju iestatījumu lapā. Dodieties uz savu profilu, lai mainītu lietotājvārdu, e-pastu vai paroli. Ja nepieciešama palīdzība, lūdzu, sazinieties ar mūsu atbalsta komandu.",
        addProduct: "Lai pievienotu produktu, dodieties uz 'Pārdot' sadaļu navigācijas izvēlnē. Aizpildiet visus nepieciešamos laukus, ieskaitot nosaukumu, cenu, kategoriju un aprakstu. Jūs varat arī pievienot attēlus un iestatīt krājuma daudzumu.",
        help: "Es saprotu, ka jums nepieciešama palīdzība. Es varu palīdzēt ar biežāk uzdotajiem jautājumiem par maksājumiem, piegādi, atgriešanu un konta pārvaldību. Ja nepieciešama specifiskāka palīdzība, es varu jūs savienot ar mūsu atbalsta komandu.",
        escalation: "Es jūs savienošu ar cilvēku atbalsta aģentu, kurš var sniegt detalizētāku palīdzību ar jūsu jautājumu.",
        default: "Es esmu šeit, lai palīdzētu! Es varu palīdzēt ar jautājumiem par maksājumiem, piegādi, atgriešanu, konta pārvaldību un tirgus vietas lietošanu. Ko jūs vēlētos zināt?"
      }
    };

    const responses = faqResponses[language as keyof typeof faqResponses] || faqResponses.en;

    // Analyze message for FAQ responses
    const messageLower = message.toLowerCase();
    let aiResponse = '';
    let needsEscalation = false;

    if (messageLower.includes('payment') || messageLower.includes('pay') || messageLower.includes('maksājum')) {
      aiResponse = responses.payment;
    } else if (messageLower.includes('shipping') || messageLower.includes('delivery') || messageLower.includes('piegād')) {
      aiResponse = responses.shipping;
    } else if (messageLower.includes('return') || messageLower.includes('refund') || messageLower.includes('atgriezt')) {
      aiResponse = responses.returns;
    } else if (messageLower.includes('account') || messageLower.includes('profile') || messageLower.includes('kont')) {
      aiResponse = responses.account;
    } else if ((messageLower.includes('product') && messageLower.includes('add')) || 
               (messageLower.includes('produkt') && messageLower.includes('pievien'))) {
      aiResponse = responses.addProduct;
    } else if (messageLower.includes('admin') || messageLower.includes('moderator') || 
               messageLower.includes('human') || messageLower.includes('support') ||
               messageLower.includes('help me') || messageLower.includes('palīdz')) {
      aiResponse = responses.escalation;
      needsEscalation = true;
    } else {
      // Use OpenAI for more complex queries with rate limiting protection
      const systemPrompt = language === 'lv' ? 
        `Tu esi palīdzīgs klientu atbalsta asistents tirgus vietnei. Atbildi latviešu valodā. Esi draudzīgs un palīdzīgs. Ja klientam nepieciešama specifiska palīdzība, ieteic sazināties ar atbalsta komandu.` :
        `You are a helpful customer support assistant for a marketplace. Be friendly and helpful. If the customer needs specific assistance, suggest contacting the support team.`;

      try {
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
            max_tokens: 300,
            temperature: 0.7,
          }),
        });

        if (response.status === 429) {
          // Rate limit hit, use fallback response
          aiResponse = language === 'lv' ? 
            'Es saprotu jūsu jautājumu. Pašlaik es piedzīvoju lielu pieprasījumu. Lūdzu, mēģiniet vēlreiz pēc brīža vai sazinieties ar mūsu atbalsta komandu specifiskai palīdzībai.' :
            'I understand your question. I\'m currently experiencing high demand. Please try again in a moment or contact our support team for specific assistance.';
        } else if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        } else {
          const data = await response.json();
          aiResponse = data.choices[0].message.content;
        }
      } catch (error) {
        console.error('OpenAI API error:', error);
        // Fallback response when OpenAI fails
        aiResponse = language === 'lv' ? 
          'Es saprotu jūsu jautājumu. Pašlaik es nevaru piekļūt visām savām zināšanām. Lūdzu, sazinieties ar mūsu atbalsta komandu, lai saņemtu palīdzību.' :
          'I understand your question. I\'m currently unable to access all my knowledge. Please contact our support team for assistance.';
      }
    }

    // Store message in database if sessionId provided
    if (sessionId) {
      try {
        // Store user message
        await supabase
          .from('chat_messages')
          .insert({
            session_id: sessionId,
            content: message,
            sender_type: 'user',
            message_type: 'text'
          });

        // Store bot response
        await supabase
          .from('chat_messages')
          .insert({
            session_id: sessionId,
            content: aiResponse,
            sender_type: 'bot',
            message_type: needsEscalation ? 'escalation' : 'text'
          });

        // Update session status if escalation needed
        if (needsEscalation) {
          await supabase
            .from('chat_sessions')
            .update({ status: 'escalated' })
            .eq('id', sessionId);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if DB fails
      }
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse, 
        needsEscalation,
        sessionId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
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