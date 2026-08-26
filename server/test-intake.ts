import { IntakeAgent } from './agents/intake.js';

async function runIntakeSimulation() {
  console.log('================================================================');
  console.log('🤖 Testing UDYORA IntakeAgent - Multi-Turn Adaptive Conversation');
  console.log('================================================================\n');

  const intakeAgent = new IntakeAgent();
  const sessionId = `test_session_${Date.now()}`;

  const turns = [
    {
      user: 'Namaste! I am Sunita Devi from Madhubani, Bihar. I run a tailoring shop and boutique called Sunita Silai Kendra for the past 3 years.',
    },
    {
      user: 'Normally our monthly sales are around Rs 45,000. But during Diwali, Chhath Puja and wedding season (Oct to Dec) sales go up to Rs 85,000. In July monsoon it drops to Rs 25,000.',
    },
    {
      user: 'My fixed costs are shop rent Rs 3,500 and electricity Rs 1,000. For fabrics, threads and laces I spend about Rs 20,000 monthly. I own 2 sewing machines worth Rs 30,000 total.',
    },
    {
      user: 'I took Rs 20,000 from a local moneylender paying Rs 2,500 monthly interest. I need a safe loan of Rs 80,000 for 24 months to buy an automatic embroidery and interlock machine.',
    },
  ];

  for (let i = 0; i < turns.length; i++) {
    console.log(`--- [Turn ${i + 1}] ---`);
    console.log(`👤 User: "${turns[i].user}"\n`);

    const result = await intakeAgent.handleMessage(sessionId, turns[i].user);

    console.log(`🤖 UDYORA Saathi: "${result.reply}"\n`);
    console.log(`📊 Progress: ${result.progress}% | Complete: ${result.profileComplete}`);
    console.log('📝 Extracted Partial Profile Snapshot:');
    console.log(JSON.stringify(result.partialProfile, null, 2));

    if (result.profileComplete && result.profile) {
      console.log('\n================================================================');
      console.log('🎉 Profile Complete! Generated Structured BusinessProfile:');
      console.log('================================================================');
      console.log(JSON.stringify(result.profile, null, 2));
    }
    console.log('----------------------------------------------------------------\n');
  }
}

runIntakeSimulation().catch(console.error);
