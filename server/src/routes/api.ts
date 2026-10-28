import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

// Controllers
import * as Auth from '../controllers/authController';
import * as Accounts from '../controllers/accountsController';
import * as Flows from '../controllers/flowsController';
import * as Surveys from '../controllers/surveysController';
import * as Analytics from '../controllers/analyticsController';
import * as Integrations from '../controllers/integrationsController';
import * as Telemetry from '../controllers/telemetryController';
import * as Delivery from '../controllers/deliveryController';
import * as Wbs from '../controllers/wbsController';

const router = Router();

// =============================================================
// Public / Ingestion Routes
// =============================================================
router.post('/auth/login', Auth.login);
router.post('/telemetry/identify', Telemetry.identifyUser);
router.post('/telemetry/track', Telemetry.trackEvent);
router.post('/telemetry/flow-event', Telemetry.recordFlowEvent);
router.post('/telemetry/survey-submit', Telemetry.submitSurvey);

// =============================================================
// Authenticated User & RBAC Protected Endpoints
// =============================================================
router.use(authenticateToken);

// Auth & Team
router.get('/auth/me', Auth.me);
router.post('/auth/switch-role', Auth.switchRole);
router.get('/auth/staff', Auth.listStaff);

// Customer Success Accounts 360
router.get('/accounts', requirePermission('account:read'), Accounts.getAccounts);
router.get('/accounts/:id', requirePermission('account:read'), Accounts.getAccountById);
router.post('/accounts', requirePermission('account:write'), Accounts.createAccount);
router.put('/accounts/:id', requirePermission('account:write'), Accounts.updateAccount);
router.delete('/accounts/:id', requirePermission('account:delete'), Accounts.deleteAccount);
router.post('/accounts/:id/touchpoint', requirePermission('account:touchpoint'), Accounts.addTouchpoint);
router.post('/accounts/:id/recalculate-health', requirePermission('account:write'), Accounts.recalculateHealth);

// Users Directory
router.get('/users', requirePermission('account:read'), Analytics.getEndUsers);

// In-App Flows & Simulator
router.get('/flows', requirePermission('flow:read'), Flows.getFlows);
router.post('/flows', requirePermission('flow:write'), Flows.createFlow);
router.put('/flows/:id', requirePermission('flow:write'), Flows.updateFlow);
router.patch('/flows/:id/status', requirePermission('flow:publish'), Flows.toggleFlowStatus);
router.delete('/flows/:id', requirePermission('flow:delete'), Flows.deleteFlow);

// Surveys & Voice of Customer
router.get('/surveys', requirePermission('survey:read'), Surveys.getSurveys);
router.post('/surveys', requirePermission('survey:write'), Surveys.createSurvey);
router.get('/surveys/feedback', requirePermission('survey:read'), Surveys.getFeedback);
router.patch('/surveys/feedback/:id/triage', requirePermission('survey:triage'), Surveys.triageFeedback);

// Analytics, Funnels & Feature Tags
router.get('/analytics/funnels', requirePermission('analytics:read'), Analytics.getFunnels);
router.get('/analytics/cohorts', requirePermission('analytics:read'), Analytics.getCohorts);
router.get('/analytics/features', requirePermission('analytics:read'), Analytics.getFeatureTags);
router.post('/analytics/features', requirePermission('analytics:tag'), Analytics.createFeatureTag);

// Integrations & API Keys
router.get('/integrations', requirePermission('account:read'), Integrations.getIntegrations);
router.patch('/integrations/:id/toggle', requirePermission('integrations:manage'), Integrations.toggleIntegration);
router.get('/integrations/keys', requirePermission('api_keys:manage'), Integrations.getApiKeys);
router.post('/integrations/keys', requirePermission('api_keys:manage'), Integrations.createApiKey);

// Executive Delivery & C-Suite Briefing
router.get('/delivery/projects', requirePermission('account:read'), Delivery.getDeliveryProjects);
router.patch('/delivery/projects/:id', requirePermission('account:write'), Delivery.updateDeliveryProject);
router.post('/delivery/projects/:id/predict', requirePermission('account:read'), Delivery.predictDelivery);
router.post('/delivery/import', requirePermission('account:write'), Delivery.importDeliveryProjects);

// Deployment Checklist & Work Breakdown Structure (WBS)
router.get('/delivery/wbs', requirePermission('account:read'), Wbs.getAllWbsTasks);
router.get('/delivery/projects/:id/wbs', requirePermission('account:read'), Wbs.getProjectWbs);
router.post('/delivery/projects/:id/wbs', requirePermission('account:write'), Wbs.createWbsTask);
router.patch('/delivery/wbs/:taskId', requirePermission('account:write'), Wbs.updateWbsTask);
router.delete('/delivery/wbs/:taskId', requirePermission('account:write'), Wbs.deleteWbsTask);

export default router;
