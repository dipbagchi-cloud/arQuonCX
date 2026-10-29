import React, { createContext, useContext, useState, useEffect } from 'react';
import { FrontendMeta, FeatureFlagConfig, NavigationTab } from '../types';
import { api } from '../api/client';

export const DEFAULT_FRONTEND_META: FrontendMeta = {
  appName: 'arQuonCX',
  tagline: 'Enterprise Customer Success & Project Delivery Suite',
  pageTitleSuffix: 'Enterprise CS & Delivery',
  logoTheme: 'indigo',
  announcementBanner: {
    enabled: false,
    message: '🚀 Welcome to arQuonCX 2.0: Deployment WBS Engine & Role-Based Governance are now live!',
    type: 'info',
    dismissible: true,
    linkText: 'Learn More',
    linkUrl: '#overview',
  },
  supportEmail: 'support@arquoncx.io',
  docsUrl: 'https://docs.arquoncx.io',
  maintenanceMode: false,
  liveIngestionEnabled: true,
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlagConfig = {
  deliveryBriefing: true,
  deploymentWbs: true,
  accounts360: true,
  usersSegments: true,
  adoptionFlows: true,
  surveysNps: true,
  productAnalytics: true,
  resourceCenter: true,
  integrations: true,
  aiForecasting: true,
};

interface FrontendMetaContextType {
  meta: FrontendMeta;
  featureFlags: FeatureFlagConfig;
  defaultLandingTab: string;
  updateMeta: (updates: Partial<FrontendMeta>) => Promise<void>;
  updateFeatureFlags: (flags: Partial<FeatureFlagConfig>) => Promise<void>;
  updateDefaultLandingTab: (tab: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isModuleEnabled: (key: keyof FeatureFlagConfig) => boolean;
  isTabVisible: (tab: NavigationTab) => boolean;
  isBannerDismissed: boolean;
  dismissBanner: () => void;
}

const FrontendMetaContext = createContext<FrontendMetaContextType | undefined>(undefined);

export const FrontendMetaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meta, setMeta] = useState<FrontendMeta>(() => {
    try {
      const saved = localStorage.getItem('arquoncx_frontend_meta');
      return saved ? { ...DEFAULT_FRONTEND_META, ...JSON.parse(saved) } : DEFAULT_FRONTEND_META;
    } catch {
      return DEFAULT_FRONTEND_META;
    }
  });

  const [featureFlags, setFeatureFlags] = useState<FeatureFlagConfig>(() => {
    try {
      const saved = localStorage.getItem('arquoncx_feature_flags');
      return saved ? { ...DEFAULT_FEATURE_FLAGS, ...JSON.parse(saved) } : DEFAULT_FEATURE_FLAGS;
    } catch {
      return DEFAULT_FEATURE_FLAGS;
    }
  });

  const [defaultLandingTab, setDefaultLandingTab] = useState<string>(() => {
    return localStorage.getItem('arquoncx_default_tab') || 'overview';
  });

  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Sync document title on meta change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${meta.appName} | ${meta.pageTitleSuffix}`;
    }
  }, [meta.appName, meta.pageTitleSuffix]);

  // Fetch initial meta from backend API with localStorage fallback
  useEffect(() => {
    async function loadBackendMeta() {
      try {
        const res = await api.admin.getMeta();
        if (res.success && res.meta) {
          setMeta(prev => ({ ...prev, ...res.meta }));
          if (res.featureFlags) {
            setFeatureFlags(prev => ({ ...prev, ...res.featureFlags }));
          }
          if (res.defaultLandingTab) {
            setDefaultLandingTab(res.defaultLandingTab);
          }
        }
      } catch (err) {
        // Fallback gracefully to localStorage and preset defaults
        console.info('FrontendMeta: Running with local configuration state.');
      }
    }
    loadBackendMeta();
  }, []);

  const updateMeta = async (updates: Partial<FrontendMeta>) => {
    const updated: FrontendMeta = {
      ...meta,
      ...updates,
      announcementBanner: {
        ...meta.announcementBanner,
        ...(updates.announcementBanner || {}),
      },
    };

    setMeta(updated);
    try {
      localStorage.setItem('arquoncx_frontend_meta', JSON.stringify(updated));
      await api.admin.updateMeta({ meta: updated });
    } catch (err) {
      console.warn('Backend meta update note:', err);
    }
  };

  const updateFeatureFlags = async (flags: Partial<FeatureFlagConfig>) => {
    const updated: FeatureFlagConfig = {
      ...featureFlags,
      ...flags,
    };

    setFeatureFlags(updated);
    try {
      localStorage.setItem('arquoncx_feature_flags', JSON.stringify(updated));
      await api.admin.updateMeta({ flags: updated });
    } catch (err) {
      console.warn('Backend flags update note:', err);
    }
  };

  const updateDefaultLandingTab = async (tab: string) => {
    setDefaultLandingTab(tab);
    try {
      localStorage.setItem('arquoncx_default_tab', tab);
      await api.admin.updateMeta({ landingTab: tab });
    } catch (err) {
      console.warn('Backend tab update note:', err);
    }
  };

  const resetToDefaults = async () => {
    setMeta(DEFAULT_FRONTEND_META);
    setFeatureFlags(DEFAULT_FEATURE_FLAGS);
    setDefaultLandingTab('overview');
    localStorage.removeItem('arquoncx_frontend_meta');
    localStorage.removeItem('arquoncx_feature_flags');
    localStorage.removeItem('arquoncx_default_tab');
    try {
      await api.admin.updateMeta({
        meta: DEFAULT_FRONTEND_META,
        flags: DEFAULT_FEATURE_FLAGS,
        landingTab: 'overview',
      });
    } catch (err) {
      console.warn('Reset meta notice:', err);
    }
  };

  const isModuleEnabled = (key: keyof FeatureFlagConfig): boolean => {
    return featureFlags[key] !== false;
  };

  const isTabVisible = (tab: NavigationTab): boolean => {
    switch (tab) {
      case 'delivery-briefing':
        return featureFlags.deliveryBriefing;
      case 'deployment-wbs':
        return featureFlags.deploymentWbs;
      case 'accounts':
        return featureFlags.accounts360;
      case 'users':
        return featureFlags.usersSegments;
      case 'flows':
        return featureFlags.adoptionFlows;
      case 'surveys':
        return featureFlags.surveysNps;
      case 'analytics':
        return featureFlags.productAnalytics;
      case 'resource-center':
        return featureFlags.resourceCenter;
      case 'integrations':
        return featureFlags.integrations;
      case 'overview':
      case 'admin-portal':
      default:
        return true;
    }
  };

  const dismissBanner = () => {
    setIsBannerDismissed(true);
  };

  return (
    <FrontendMetaContext.Provider
      value={{
        meta,
        featureFlags,
        defaultLandingTab,
        updateMeta,
        updateFeatureFlags,
        updateDefaultLandingTab,
        resetToDefaults,
        isModuleEnabled,
        isTabVisible,
        isBannerDismissed,
        dismissBanner,
      }}
    >
      {children}
    </FrontendMetaContext.Provider>
  );
};

export const useFrontendMeta = () => {
  const ctx = useContext(FrontendMetaContext);
  if (!ctx) {
    throw new Error('useFrontendMeta must be used within FrontendMetaProvider');
  }
  return ctx;
};
