import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { AnnouncementBanner } from './components/layout/AnnouncementBanner';
import { ResourceCenterWidget } from './components/layout/ResourceCenterWidget';
import { OverviewPage } from './components/pages/OverviewPage';
import { AccountsPage } from './components/pages/AccountsPage';
import { UsersPage } from './components/pages/UsersPage';
import { FlowsPage } from './components/pages/FlowsPage';
import { SurveysPage } from './components/pages/SurveysPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { ResourceCenterPage } from './components/pages/ResourceCenterPage';
import { IntegrationsPage } from './components/pages/IntegrationsPage';
import { DeliveryBriefingPage } from './components/pages/DeliveryBriefingPage';
import { DeploymentWBSPage } from './components/pages/DeploymentWBSPage';
import { AdminPortalPage } from './components/pages/AdminPortalPage';
import { useFrontendMeta } from './context/FrontendMetaContext';

import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { PrivacyPolicyPage } from './components/pages/legal/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/pages/legal/TermsOfServicePage';
import { SecuritySsoPage } from './components/pages/legal/SecuritySsoPage';

import { AccountDetailDrawer } from './components/modals/AccountDetailDrawer';
import { DeliveryDetailDrawer } from './components/modals/DeliveryDetailDrawer';
import { FlowSimulatorModal } from './components/modals/FlowSimulatorModal';
import { CreateSurveyModal } from './components/modals/CreateSurveyModal';
import { CreateSegmentModal } from './components/modals/CreateSegmentModal';
import { ExcelDeliveryImportModal } from './components/modals/ExcelDeliveryImportModal';

import { 
  MOCK_ACCOUNTS, 
  MOCK_USERS, 
  MOCK_FLOWS, 
  MOCK_FEEDBACK, 
  MOCK_SURVEYS, 
  MOCK_FEATURE_TAGS, 
  MOCK_FUNNEL_STEPS, 
  MOCK_RETENTION_COHORTS, 
  MOCK_INTEGRATIONS, 
  MOCK_RESOURCE_MODULES,
  MOCK_DELIVERY_PROJECTS,
  MOCK_WBS_TASKS
} from './data/mockData';
import { NavigationTab, Account, Flow, Survey, FeedbackItem, ResourceModule, Integration, DeliveryProject, WbsTask } from './types';
import { calculateWbsProgress, calculateConfidenceScore, calculatePredictedGoLive } from './utils/wbsMetrics';
import { api } from './api/client';

type AppView = 'landing' | 'login' | 'app' | 'privacy' | 'terms' | 'security';

const getInitialView = (): AppView => {
  if (typeof window === 'undefined') return 'landing';
  const hash = window.location.hash.toLowerCase();
  if (hash === '#privacy' || hash === '#privacy-policy') return 'privacy';
  if (hash === '#terms' || hash === '#terms-of-service') return 'terms';
  if (hash === '#security' || hash === '#sso' || hash === '#security-sso') return 'security';
  if (hash === '#login') return 'login';
  if (hash === '#app' || hash === '#dashboard') return 'app';
  return 'landing';
};

export function App() {
  const { meta, featureFlags } = useFrontendMeta();
  // Navigation / Auth View: 'landing', 'login', 'app', 'privacy', 'terms', 'security'
  const [appView, setAppView] = useState<AppView>(getInitialView);

  // Sync hash changes (e.g. browser back/forward or direct URL links)
  useEffect(() => {
    const handleHashChange = () => {
      setAppView(getInitialView());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: AppView) => {
    setAppView(view);
    if (view === 'landing') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.location.hash = view;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Data states (interactive)
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [flows, setFlows] = useState<Flow[]>(MOCK_FLOWS);
  const [feedback, setFeedback] = useState<FeedbackItem[]>(MOCK_FEEDBACK);
  const [surveys, setSurveys] = useState<Survey[]>(MOCK_SURVEYS);
  const [modules, setModules] = useState<ResourceModule[]>(MOCK_RESOURCE_MODULES);
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [deliveryProjects, setDeliveryProjects] = useState<DeliveryProject[]>(MOCK_DELIVERY_PROJECTS);
  const [wbsTasks, setWbsTasks] = useState<WbsTask[]>(MOCK_WBS_TASKS);
  const [selectedWbsProjectId, setSelectedWbsProjectId] = useState<string | undefined>(undefined);

  // Fetch live backend data from SQLite/PostgreSQL
  useEffect(() => {
    async function fetchLiveData() {
      try {
        const [accRes, flowRes, survRes, fbRes, usrRes, igRes, delivRes, wbsRes] = await Promise.allSettled([
          api.accounts.list(),
          api.flows.list(),
          api.surveys.list(),
          api.surveys.feedback(),
          api.users.list(),
          api.integrations.list(),
          api.delivery.list(),
          api.delivery.listAllWbs(),
        ]);

        if (accRes.status === 'fulfilled' && accRes.value.accounts?.length) {
          setAccounts(accRes.value.accounts);
        }
        if (flowRes.status === 'fulfilled' && flowRes.value.flows?.length) {
          setFlows(flowRes.value.flows);
        }
        if (survRes.status === 'fulfilled' && survRes.value.surveys?.length) {
          setSurveys(survRes.value.surveys);
        }
        if (fbRes.status === 'fulfilled' && fbRes.value.feedback?.length) {
          setFeedback(fbRes.value.feedback);
        }
        if (usrRes.status === 'fulfilled' && usrRes.value.users?.length) {
          setUsers(usrRes.value.users);
        }
        if (igRes.status === 'fulfilled' && igRes.value.integrations?.length) {
          setIntegrations(igRes.value.integrations);
        }
        if (delivRes.status === 'fulfilled' && delivRes.value.projects?.length) {
          setDeliveryProjects(delivRes.value.projects);
        }
        if (wbsRes.status === 'fulfilled' && wbsRes.value?.tasks?.length) {
          setWbsTasks(wbsRes.value.tasks);
        }
      } catch (e) {
        console.warn('Backend API sync notice: Using pre-seeded telemetry data.', e);
      }
    }

    if (appView === 'app') {
      fetchLiveData();
    }
  }, [appView]);

  // Filters & Global Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');

  // Modal / Drawer states
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedDeliveryProject, setSelectedDeliveryProject] = useState<DeliveryProject | null>(null);
  const [isDeliveryDrawerOpen, setIsDeliveryDrawerOpen] = useState(false);
  const [isDeliveryImportOpen, setIsDeliveryImportOpen] = useState(false);
  const [isFlowSimulatorOpen, setIsFlowSimulatorOpen] = useState(false);
  const [isCreateSurveyOpen, setIsCreateSurveyOpen] = useState(false);
  const [isCreateSegmentOpen, setIsCreateSegmentOpen] = useState(false);
  const [isResourceCenterOpen, setIsResourceCenterOpen] = useState(false);

  // Handler: select delivery project for drawer
  const handleSelectDeliveryProject = (project: DeliveryProject) => {
    setSelectedDeliveryProject(project);
    setIsDeliveryDrawerOpen(true);
  };

  // Handler: import delivery projects from Excel / CSV
  const handleImportDeliveryProjects = async (projects: DeliveryProject[], mode: 'replace' | 'merge') => {
    try {
      const res = await api.delivery.import(projects, mode);
      if (res.success && res.projects) {
        setDeliveryProjects(res.projects);
        return;
      }
    } catch (err) {
      console.warn('API delivery import fallback notice:', err);
    }

    // Local state fallback if server unavailable
    setDeliveryProjects(prev => {
      if (mode === 'replace') {
        return projects;
      }
      const updated = [...prev];
      projects.forEach(incoming => {
        const idx = updated.findIndex(
          p => p.id === incoming.id || p.accountName.toLowerCase() === incoming.accountName.toLowerCase()
        );
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], ...incoming };
        } else {
          updated.push(incoming);
        }
      });
      return updated;
    });
  };

  // Handler: update delivery project
  const handleUpdateDeliveryProject = async (id: string, updates: Partial<DeliveryProject>) => {
    setDeliveryProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (selectedDeliveryProject?.id === id) {
      setSelectedDeliveryProject(prev => prev ? { ...prev, ...updates } : null);
    }
    try {
      await api.delivery.update(id, updates);
    } catch (err) {
      console.warn('API delivery update notice:', err);
    }
  };

  // Handler: recalculate predictive forecast
  const handlePredictDeliveryProject = async (id: string) => {
    try {
      const res = await api.delivery.predict(id);
      if (res.success && res.prediction) {
        setDeliveryProjects(prev => prev.map(p => {
          if (p.id === id) {
            return {
              ...p,
              ...res.prediction
            };
          }
          return p;
        }));
        if (selectedDeliveryProject?.id === id) {
          setSelectedDeliveryProject(prev => prev ? { ...prev, ...res.prediction } : null);
        }
      }
    } catch (err) {
      // Local fallback calculation
      setDeliveryProjects(prev => prev.map(p => {
        if (p.id === id) {
          const confidence = Math.min(98, p.confidenceScore + 4);
          return { ...p, confidenceScore: confidence };
        }
        return p;
      }));
    }
  };

  // Navigation helper for WBS
  const handleNavigateToWbs = (projectId?: string) => {
    setSelectedWbsProjectId(projectId);
    setCurrentTab('deployment-wbs');
  };

  // Recalculate parent project metrics whenever tasks change
  const syncParentProjectMetrics = (projectId: string, currentTasks: WbsTask[]) => {
    const pTasks = currentTasks.filter(t => t.projectId === projectId);
    const newProgress = calculateWbsProgress(pTasks);
    setDeliveryProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newConfidence = calculateConfidenceScore(pTasks, p);
        const forecast = calculatePredictedGoLive(p.baselineTargetDate, newProgress, newConfidence);
        const newHealth = newConfidence < 50 ? 'critical' : newConfidence < 75 ? 'at-risk' : 'on-track';
        return {
          ...p,
          phaseProgress: newProgress,
          confidenceScore: newConfidence,
          predictedGoLiveDate: forecast.predictedDate,
          varianceDays: forecast.varianceDays,
          deliveryHealth: newHealth,
        };
      }
      return p;
    }));
  };

  // Handler: update WBS task
  const handleUpdateWbsTask = async (taskId: string, updates: Partial<WbsTask>) => {
    let targetProjectId: string | undefined;
    let nextTasks: WbsTask[] = [];

    setWbsTasks(prev => {
      nextTasks = prev.map(t => {
        if (t.id === taskId) {
          targetProjectId = t.projectId;
          return { ...t, ...updates };
        }
        return t;
      });
      return nextTasks;
    });

    if (targetProjectId) {
      syncParentProjectMetrics(targetProjectId, nextTasks);
    }

    try {
      await api.delivery.updateWbsTask(taskId, updates);
    } catch (err) {
      console.warn('API update WBS task notice:', err);
    }
  };

  // Handler: create WBS task
  const handleCreateWbsTask = async (taskData: Partial<WbsTask>) => {
    const defaultProj = deliveryProjects.find(p => p.id === taskData.projectId) || deliveryProjects[0];
    const targetProjectId = taskData.projectId || defaultProj?.id || 'proj-shpl';
    const newTask: WbsTask = {
      id: taskData.id || `wbs-${Date.now()}`,
      projectId: targetProjectId,
      phase: taskData.phase || 'Phase 1: Foundation',
      workPackage: taskData.workPackage || 'Technical Setup',
      taskName: taskData.taskName || 'New Deliverable',
      assignedUser: taskData.assignedUser || { 
        id: 'usr-dip', 
        name: 'Dip Bagchi', 
        role: 'Director of Customer Success', 
        avatar: '', 
        email: 'dip@arquoncx.com' 
      },
      estimatedHours: taskData.estimatedHours || 8,
      actualHours: taskData.actualHours || 0,
      plannedStart: taskData.plannedStart || new Date().toISOString().split('T')[0],
      plannedFinish: taskData.plannedFinish || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: taskData.status || 'not-started',
      progress: taskData.progress || 0,
      priority: taskData.priority || 'medium',
      isMilestone: taskData.isMilestone ?? false,
      isCriticalPath: taskData.isCriticalPath ?? false,
      blockerNote: taskData.blockerNote,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    let nextTasks: WbsTask[] = [];
    setWbsTasks(prev => {
      nextTasks = [newTask, ...prev];
      return nextTasks;
    });

    syncParentProjectMetrics(newTask.projectId, nextTasks);

    try {
      await api.delivery.createWbsTask(newTask.projectId, newTask);
    } catch (err) {
      console.warn('API create WBS task notice:', err);
    }
  };

  // Handler: delete WBS task
  const handleDeleteWbsTask = async (taskId: string) => {
    let targetProjectId: string | undefined;
    let nextTasks: WbsTask[] = [];

    setWbsTasks(prev => {
      const found = prev.find(t => t.id === taskId);
      targetProjectId = found?.projectId;
      nextTasks = prev.filter(t => t.id !== taskId);
      return nextTasks;
    });

    if (targetProjectId) {
      syncParentProjectMetrics(targetProjectId, nextTasks);
    }

    try {
      await api.delivery.deleteWbsTask(taskId);
    } catch (err) {
      console.warn('API delete WBS task notice:', err);
    }
  };

  // Handler: Ingest and synchronize Azure DevOps tasks
  const handleAdoSyncTasks = (syncedTasks: WbsTask[], updatedProject?: DeliveryProject) => {
    setWbsTasks(prev => {
      const otherTasks = prev.filter(t => !syncedTasks.some(st => st.id === t.id));
      return [...otherTasks, ...syncedTasks];
    });

    if (updatedProject) {
      setDeliveryProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    }
  };

  // Handler: toggle flow status
  const handleToggleFlowStatus = async (flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    const newStatus = flow?.status === 'live' ? 'paused' : 'live';

    // Optimistic UI update
    setFlows(prev => prev.map(f => {
      if (f.id === flowId) {
        return { ...f, status: newStatus };
      }
      return f;
    }));

    try {
      await api.flows.toggleStatus(flowId, newStatus as any);
    } catch (err) {
      console.warn('API status toggle error:', err);
    }
  };

  // Handler: save new flow from simulator
  const handleSaveFlow = async (newFlow: Flow) => {
    setFlows([newFlow, ...flows]);
    try {
      await api.flows.create(newFlow);
    } catch (err) {
      console.warn('API flow creation error:', err);
    }
  };

  // Handler: close the loop on feedback
  const handleCloseTheLoop = async (feedbackId: string) => {
    setFeedback(prev => prev.map(f => {
      if (f.id === feedbackId) {
        return { ...f, status: 'addressed' };
      }
      return f;
    }));

    try {
      await api.surveys.triageFeedback(feedbackId, { status: 'addressed' });
    } catch (err) {
      console.warn('API triage feedback error:', err);
    }
  };

  // Handler: save survey
  const handleSaveSurvey = async (newSurvey: Survey) => {
    setSurveys([newSurvey, ...surveys]);
    try {
      await api.surveys.create(newSurvey);
    } catch (err) {
      console.warn('API survey creation error:', err);
    }
  };

  // Handler: toggle resource module
  const handleToggleModule = (id: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  // Handler: toggle integration
  const handleToggleIntegration = async (id: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status: i.status === 'connected' ? 'disconnected' : 'connected',
          lastSync: i.status === 'connected' ? undefined : 'Just now'
        };
      }
      return i;
    }));

    try {
      await api.integrations.toggle(id);
    } catch (err) {
      console.warn('API integration toggle error:', err);
    }
  };

  // Handler: trigger flow for specific account
  const handleTriggerFlowForAccount = (accountId: string) => {
    setIsFlowSimulatorOpen(true);
  };

  // 1. Render Public Marketing Homepage
  if (appView === 'landing') {
    return (
      <LandingPage
        onGoToLogin={() => navigateTo('login')}
        onEnterApp={() => navigateTo('app')}
        onNavigateToPrivacy={() => navigateTo('privacy')}
        onNavigateToTerms={() => navigateTo('terms')}
        onNavigateToSecurity={() => navigateTo('security')}
      />
    );
  }

  // 2. Render Login Screen
  if (appView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={(targetTab) => {
          if (targetTab) {
            setCurrentTab(targetTab);
          }
          navigateTo('app');
        }}
        onBackToHome={() => navigateTo('landing')}
      />
    );
  }

  // 3. Render Privacy Policy Page
  if (appView === 'privacy') {
    return (
      <PrivacyPolicyPage
        onBackToHome={() => navigateTo('landing')}
        onEnterApp={() => navigateTo('app')}
        onNavigateToTerms={() => navigateTo('terms')}
        onNavigateToSecurity={() => navigateTo('security')}
      />
    );
  }

  // 4. Render Terms of Service Page
  if (appView === 'terms') {
    return (
      <TermsOfServicePage
        onBackToHome={() => navigateTo('landing')}
        onEnterApp={() => navigateTo('app')}
        onNavigateToPrivacy={() => navigateTo('privacy')}
        onNavigateToSecurity={() => navigateTo('security')}
      />
    );
  }

  // 5. Render Security & SSO Page
  if (appView === 'security') {
    return (
      <SecuritySsoPage
        onBackToHome={() => navigateTo('landing')}
        onEnterApp={() => navigateTo('app')}
        onNavigateToPrivacy={() => navigateTo('privacy')}
        onNavigateToTerms={() => navigateTo('terms')}
      />
    );
  }

  // 6. Render Main Customer Success Application
  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-[#070B19] overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors duration-150">
      {/* Global Meta Announcement Banner */}
      <AnnouncementBanner />

      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Global Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onGoToHome={() => navigateTo('landing')}
          onLogout={() => navigateTo('login')}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Header */}
          <Topbar
            currentTab={currentTab}
            onOpenFlowSimulator={() => setIsFlowSimulatorOpen(true)}
            onOpenSurveyCreator={() => setIsCreateSurveyOpen(true)}
            onOpenResourceCenter={() => setIsResourceCenterOpen(true)}
            onGoToHome={() => navigateTo('landing')}
            onLogout={() => navigateTo('login')}
            onNavigateTab={setCurrentTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
          />

          {/* Scrollable Page Body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 text-[13px]">
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Maintenance Mode Warning Notice if active */}
              {meta.maintenanceMode && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Maintenance Mode Active: Platform is in scheduled upgrade mode. Non-admin operations are in read-only mode.</span>
                </div>
              )}

            {currentTab === 'overview' && (
              <OverviewPage
                accounts={accounts}
                deliveryProjects={deliveryProjects}
                tasks={wbsTasks}
                onSelectAccount={setSelectedAccount}
                onNavigateTab={setCurrentTab}
                onOpenFlowSimulator={() => setIsFlowSimulatorOpen(true)}
                onSelectDeliveryProject={handleSelectDeliveryProject}
              />
            )}

            {currentTab === 'delivery-briefing' && (
              <DeliveryBriefingPage
                projects={deliveryProjects}
                onSelectProject={handleSelectDeliveryProject}
                onPredictProject={handlePredictDeliveryProject}
                onUpdateProject={handleUpdateDeliveryProject}
                onToggleSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                sidebarCollapsed={sidebarCollapsed}
                onOpenImportModal={() => setIsDeliveryImportOpen(true)}
                onNavigateToWbs={handleNavigateToWbs}
              />
            )}

            {currentTab === 'deployment-wbs' && (
              <DeploymentWBSPage
                projects={deliveryProjects}
                wbsTasks={wbsTasks}
                onUpdateTask={handleUpdateWbsTask}
                onCreateTask={handleCreateWbsTask}
                onDeleteTask={handleDeleteWbsTask}
                onNavigateToBriefing={() => setCurrentTab('delivery-briefing')}
                initialProjectId={selectedWbsProjectId}
                onSyncAdoTasks={handleAdoSyncTasks}
                onProjectsSynced={setDeliveryProjects}
              />
            )}

            {currentTab === 'accounts' && (
              <AccountsPage
                accounts={accounts}
                onSelectAccount={setSelectedAccount}
                onTriggerFlow={handleTriggerFlowForAccount}
              />
            )}

            {currentTab === 'users' && (
              <UsersPage
                users={users}
                onOpenCreateSegment={() => setIsCreateSegmentOpen(true)}
                onTriggerFlowToUser={() => setIsFlowSimulatorOpen(true)}
              />
            )}

            {currentTab === 'flows' && (
              <FlowsPage
                flows={flows}
                onOpenFlowSimulator={() => setIsFlowSimulatorOpen(true)}
                onToggleFlowStatus={handleToggleFlowStatus}
              />
            )}

            {currentTab === 'surveys' && (
              <SurveysPage
                surveys={surveys}
                feedback={feedback}
                onOpenCreateSurvey={() => setIsCreateSurveyOpen(true)}
                onCloseTheLoop={handleCloseTheLoop}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsPage
                featureTags={MOCK_FEATURE_TAGS}
                funnelSteps={MOCK_FUNNEL_STEPS}
                cohorts={MOCK_RETENTION_COHORTS}
              />
            )}

            {currentTab === 'resource-center' && (
              <ResourceCenterPage
                modules={modules}
                onToggleModule={handleToggleModule}
                onOpenWidget={() => setIsResourceCenterOpen(true)}
              />
            )}

            {currentTab === 'integrations' && (
              <IntegrationsPage
                integrations={integrations}
                onToggleIntegration={handleToggleIntegration}
              />
            )}

            {currentTab === 'admin-portal' && (
              <AdminPortalPage />
            )}
          </div>
        </main>
      </div>
      </div>

      {/* Floating Interactive In-App Resource Center Widget (Persistent on screen) */}
      {featureFlags.resourceCenter && (
        <ResourceCenterWidget
          isOpen={isResourceCenterOpen}
          onToggle={() => setIsResourceCenterOpen(!isResourceCenterOpen)}
          onLaunchTour={() => setIsFlowSimulatorOpen(true)}
        />
      )}

      {/* Account 360 Slideover Drawer */}
      <AccountDetailDrawer
        account={selectedAccount}
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        onTriggerFlow={handleTriggerFlowForAccount}
      />

      {/* C-Suite Project Delivery Deep-Dive Drawer */}
      <DeliveryDetailDrawer
        project={selectedDeliveryProject}
        isOpen={isDeliveryDrawerOpen}
        onClose={() => setIsDeliveryDrawerOpen(false)}
        onUpdateProject={handleUpdateDeliveryProject}
        onPredict={handlePredictDeliveryProject}
        onNavigateToWbs={handleNavigateToWbs}
      />

      {/* Flow Builder & In-App Simulator Modal */}
      <FlowSimulatorModal
        isOpen={isFlowSimulatorOpen}
        onClose={() => setIsFlowSimulatorOpen(false)}
        onSaveFlow={handleSaveFlow}
      />

      {/* Create Survey Modal */}
      <CreateSurveyModal
        isOpen={isCreateSurveyOpen}
        onClose={() => setIsCreateSurveyOpen(false)}
        onSaveSurvey={handleSaveSurvey}
      />

      {/* Create Smart Segment Modal */}
      <CreateSegmentModal
        isOpen={isCreateSegmentOpen}
        onClose={() => setIsCreateSegmentOpen(false)}
        onSaveSegment={(name) => alert(`Segment "${name}" created successfully!`)}
      />

      {/* Excel / CSV Delivery Briefing Import Modal */}
      <ExcelDeliveryImportModal
        isOpen={isDeliveryImportOpen}
        onClose={() => setIsDeliveryImportOpen(false)}
        onImport={handleImportDeliveryProjects}
      />
    </div>
  );
}

export default App;
