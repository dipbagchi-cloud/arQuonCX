import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { 
  MOCK_ACCOUNTS, 
  MOCK_USERS, 
  MOCK_FLOWS, 
  MOCK_FEEDBACK, 
  MOCK_SURVEYS, 
  MOCK_FEATURE_TAGS, 
  MOCK_INTEGRATIONS 
} from '../src/data/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting arQuonCX database seeding...');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'arquon-enterprise' },
    update: {},
    create: {
      id: 'org_arquoncx',
      name: 'arQuonCX Global',
      slug: 'arquon-enterprise',
      plan: 'Enterprise',
      domain: 'arquoncx.io',
    },
  });
  console.log('✅ Organization created:', org.name);

  // 2. Create Internal RBAC Staff Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const staffUsers = [
    {
      id: 'user_admin',
      email: 'admin@arquoncx.io',
      name: 'Dr. Aris Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: 'SUPER_ADMIN',
      title: 'VP of Customer Success & Operations',
    },
    {
      id: 'user_csops',
      email: 'csops@arquoncx.io',
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      role: 'CS_OPS',
      title: 'CS Operations & Data Analyst',
    },
    {
      id: 'user_csm',
      email: 'elena@arquoncx.io',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      role: 'CSM',
      title: 'Lead Enterprise CSM',
    },
    {
      id: 'user_product',
      email: 'product@arquoncx.io',
      name: 'Sophia Lindqvist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      role: 'PRODUCT_GROWTH',
      title: 'Head of Product Growth & Onboarding',
    },
    {
      id: 'user_viewer',
      email: 'viewer@arquoncx.io',
      name: 'Alex Wright',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      role: 'VIEWER',
      title: 'Sales & Customer Executive Stakeholder',
    },
  ];

  for (const staff of staffUsers) {
    await prisma.user.upsert({
      where: { email: staff.email },
      update: { role: staff.role },
      create: {
        id: staff.id,
        email: staff.email,
        passwordHash,
        name: staff.name,
        avatar: staff.avatar,
        role: staff.role,
        title: staff.title,
        organizationId: org.id,
      },
    });
  }
  console.log(`✅ Seeded ${staffUsers.length} internal RBAC users (Super Admin, CS Ops, CSM, Product, Viewer).`);

  // 3. Seed Accounts, Contacts, Milestones & Touchpoints
  for (const acc of MOCK_ACCOUNTS) {
    await prisma.account.upsert({
      where: { id: acc.id },
      update: {},
      create: {
        id: acc.id,
        name: acc.name,
        domain: acc.domain,
        logo: acc.logo,
        plan: acc.plan,
        mrr: acc.mrr,
        arr: acc.arr,
        csmName: acc.csmName,
        csmAvatar: acc.csmAvatar,
        healthScore: acc.healthScore,
        healthTier: acc.healthTier,
        npsScore: acc.npsScore,
        seatsTotal: acc.seatsTotal,
        seatsUsed: acc.seatsUsed,
        renewalDate: acc.renewalDate,
        daysToRenewal: acc.daysToRenewal,
        tags: JSON.stringify(acc.tags),
        usageScore: acc.healthFactors.usage,
        supportScore: acc.healthFactors.support,
        championScore: acc.healthFactors.champion,
        lastActiveDaysAgo: acc.lastActiveDaysAgo,
        onboardingProgress: acc.onboardingProgress,
        notes: acc.notes,
        organizationId: org.id,
        contacts: {
          create: acc.contacts.map(c => ({
            name: c.name,
            role: c.role,
            email: c.email,
            isChampion: !!c.isChampion,
          })),
        },
        milestones: {
          create: acc.milestones.map(m => ({
            title: m.title,
            completed: m.completed,
            date: m.date,
          })),
        },
        touchpoints: {
          create: [
            {
              note: `Initial onboarding QBR scheduled by ${acc.csmName}. Customer satisfied with early adoption metrics.`,
              touchpointType: 'Quarterly Check-in',
              csmName: acc.csmName,
            },
          ],
        },
      },
    });
  }
  console.log(`✅ Seeded ${MOCK_ACCOUNTS.length} customer accounts with contacts and milestones.`);

  // 4. Seed End Users
  for (const u of MOCK_USERS) {
    await prisma.endUser.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        accountId: u.accountId,
        role: u.role,
        healthScore: u.healthScore,
        healthTier: u.healthTier,
        lastSeen: u.lastSeen,
        totalSessions: u.totalSessions,
        featureAdoptionCount: u.featureAdoptionCount,
        segmentTags: JSON.stringify(u.segmentTags),
        joinedDate: u.joinedDate,
        plan: u.plan,
      },
    });
  }
  console.log(`✅ Seeded ${MOCK_USERS.length} client end-users.`);

  // 5. Seed In-App Flows & Steps
  for (const f of MOCK_FLOWS) {
    await prisma.flow.upsert({
      where: { id: f.id },
      update: {},
      create: {
        id: f.id,
        name: f.name,
        type: f.type,
        status: f.status,
        targetAudience: f.targetAudience,
        triggerEvent: f.triggerEvent,
        impressions: f.impressions,
        completedCount: f.completedCount,
        completionRate: f.completionRate,
        dropOffRate: f.dropOffRate,
        goalName: f.goalName,
        goalConversion: f.goalConversion,
        lastEdited: f.lastEdited,
        organizationId: org.id,
        steps: {
          create: f.steps.map(s => ({
            stepNumber: s.stepNumber,
            title: s.title,
            content: s.content,
            targetElement: s.targetElement,
            buttonText: s.buttonText,
            type: s.type,
          })),
        },
      },
    });
  }
  console.log(`✅ Seeded ${MOCK_FLOWS.length} in-app onboarding flows.`);

  // 6. Seed Surveys and Feedback Items
  for (const s of MOCK_SURVEYS) {
    await prisma.survey.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        title: s.title,
        type: s.type,
        responsesCount: s.responsesCount,
        score: s.score,
        scoreNumeric: s.scoreNumeric,
        status: s.status,
        dateCreated: s.dateCreated,
        targetSegment: s.targetSegment,
        organizationId: org.id,
      },
    });
  }

  for (const fb of MOCK_FEEDBACK) {
    await prisma.feedbackItem.upsert({
      where: { id: fb.id },
      update: {},
      create: {
        id: fb.id,
        userName: fb.userName,
        userAvatar: fb.userAvatar,
        accountName: fb.accountName,
        score: fb.score,
        category: fb.category,
        tags: JSON.stringify(fb.tags),
        comment: fb.comment,
        sentiment: fb.sentiment,
        csmAssigned: fb.csmAssigned,
        status: fb.status,
        date: fb.date,
        surveyId: MOCK_SURVEYS[0]?.id,
      },
    });
  }
  console.log(`✅ Seeded ${MOCK_SURVEYS.length} surveys and ${MOCK_FEEDBACK.length} feedback items.`);

  // 7. Seed Feature Tags
  for (const ft of MOCK_FEATURE_TAGS) {
    await prisma.featureTag.upsert({
      where: { id: ft.id },
      update: {},
      create: {
        id: ft.id,
        name: ft.name,
        selector: ft.selector,
        section: ft.section,
        monthlyClicks: ft.monthlyClicks,
        uniqueUsers: ft.uniqueUsers,
        adoptionPercentage: ft.adoptionPercentage,
        trend: ft.trend,
      },
    });
  }
  console.log(`✅ Seeded ${MOCK_FEATURE_TAGS.length} feature tags.`);

  // 8. Seed Integrations
  for (const ig of MOCK_INTEGRATIONS) {
    await prisma.integration.upsert({
      where: { id: ig.id },
      update: {},
      create: {
        id: ig.id,
        name: ig.name,
        category: ig.category,
        icon: ig.icon,
        description: ig.description,
        status: ig.status,
        lastSync: ig.lastSync,
        eventCount: ig.eventCount,
        organizationId: org.id,
      },
    });
  }
  console.log(`✅ Seeded ${MOCK_INTEGRATIONS.length} integrations.`);

  // 9. Seed API Key & Audit Log
  await prisma.apiKey.create({
    data: {
      name: 'Production In-App SDK Key',
      key: 'aq_live_8f39b201a47cd981',
      environment: 'production',
      organizationId: org.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: 'user_admin',
      action: 'ORGANIZATION_INITIALIZED',
      resourceType: 'Organization',
      resourceId: org.id,
      details: 'arQuonCX platform database initialized and pre-seeded with customer telemetry.',
    },
  });
  console.log('✅ Seeded production API Key and initial Audit Log entry.');

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
