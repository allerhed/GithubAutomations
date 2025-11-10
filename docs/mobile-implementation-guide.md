# SimpleCRM Mobile Implementation Guide

**Technical Reference for Development Teams**

## 1. Technology Stack

### 1.1. Responsive Web Application

#### Frontend Framework
```
- Framework: React 18+ or Vue 3+
- State Management: Redux Toolkit or Pinia
- UI Library: Material-UI or Tailwind CSS
- PWA: Workbox for service workers
- Build Tool: Vite or Webpack 5
```

#### Mobile Optimization Libraries
```
- Gesture Handling: react-use-gesture or Hammer.js
- Touch Events: touch-action CSS properties
- Viewport: viewport-units-buggyfill
- Smooth Scrolling: react-spring or framer-motion
```

#### Performance Tools
```
- Code Splitting: React.lazy() with Suspense
- Image Optimization: next/image or lazy loading
- Bundle Analysis: webpack-bundle-analyzer
- Performance Monitoring: web-vitals, Lighthouse CI
```

### 1.2. Native Mobile Applications

#### Option A: React Native (Recommended)
```
Benefits:
- Shared codebase (70-80%)
- Hot reloading for faster development
- Large ecosystem and community
- Near-native performance

Tech Stack:
- React Native 0.72+
- Navigation: React Navigation 6
- State: Redux Toolkit + RTK Query
- UI: React Native Paper or Native Base
- Icons: react-native-vector-icons
```

#### Option B: Native Development
```
iOS:
- Language: Swift 5.9+
- UI: SwiftUI
- Networking: URLSession + Combine
- Storage: CoreData or Realm Swift
- DI: Swinject

Android:
- Language: Kotlin 1.9+
- UI: Jetpack Compose
- Networking: Retrofit + OkHttp
- Storage: Room or Realm Kotlin
- DI: Hilt/Dagger
```

## 2. Architecture Patterns

### 2.1. Responsive Web Architecture

```
src/
├── components/
│   ├── mobile/           # Mobile-specific components
│   │   ├── MobilePipeline/
│   │   ├── MobileContactList/
│   │   └── MobileNavigation/
│   ├── desktop/          # Desktop-specific components
│   └── shared/           # Shared components
├── hooks/
│   ├── useMediaQuery.ts  # Responsive hooks
│   ├── useOrientation.ts
│   └── useTouchGestures.ts
├── layouts/
│   ├── MobileLayout.tsx
│   └── DesktopLayout.tsx
├── services/
│   ├── api/
│   ├── offline/          # Offline storage
│   └── sync/             # Background sync
└── utils/
    ├── responsive.ts
    └── deviceDetection.ts
```

### 2.2. React Native Architecture

```
src/
├── screens/              # Screen components
│   ├── Dashboard/
│   ├── Pipeline/
│   ├── Contacts/
│   └── Activities/
├── components/           # Reusable components
│   ├── ui/              # Basic UI components
│   └── business/        # Business logic components
├── navigation/           # Navigation configuration
├── services/
│   ├── api/             # API integration
│   ├── storage/         # Local storage
│   └── sync/            # Offline sync
├── store/               # Redux store
│   ├── slices/
│   └── middleware/
├── hooks/               # Custom hooks
├── utils/               # Utilities
└── assets/              # Images, fonts, etc.
```

### 2.3. Clean Architecture (Native Apps)

```
Domain Layer (Business Logic)
├── Entities (Deal, Contact, Activity)
├── Use Cases (GetDeals, UpdateDeal)
└── Repository Interfaces

Data Layer
├── Repository Implementations
├── Data Sources (Remote, Local)
├── Models & Mappers
└── Cache Management

Presentation Layer
├── ViewModels/Presenters
├── Views/UI Components
└── Navigation
```

## 3. API Design for Mobile

### 3.1. Mobile-Optimized Endpoints

```typescript
// Batch endpoint to reduce requests
POST /api/mobile/batch
{
  "requests": [
    { "method": "GET", "path": "/deals" },
    { "method": "GET", "path": "/contacts/recent" },
    { "method": "GET", "path": "/activities/today" }
  ]
}

// Lightweight endpoints with field selection
GET /api/mobile/deals?fields=id,name,value,stage,contact.name

// Delta sync endpoint
GET /api/mobile/sync?since=2025-11-10T12:00:00Z
{
  "deals": { "updated": [...], "deleted": [ids] },
  "contacts": { "updated": [...], "deleted": [ids] }
}

// Paginated responses
GET /api/mobile/contacts?page=1&limit=50
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 500,
    "hasMore": true
  }
}
```

### 3.2. GraphQL Alternative

```graphql
query MobileDashboard {
  me {
    todayActivities(limit: 10) {
      id
      type
      dueAt
      contact {
        id
        name
      }
    }
    pipeline {
      stages {
        name
        dealCount
        totalValue
      }
    }
    recentDeals(limit: 5) {
      id
      name
      value
      stage
    }
  }
}
```

### 3.3. Offline Support

```typescript
// Queue offline actions
interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'deal' | 'contact' | 'activity';
  data: any;
  timestamp: number;
  retryCount: number;
}

// Local storage structure
{
  "offline_queue": OfflineAction[],
  "cached_deals": Deal[],
  "cached_contacts": Contact[],
  "last_sync": "2025-11-10T15:30:00Z"
}
```

## 4. Responsive Design Implementation

### 4.1. Breakpoints

```css
/* Mobile-first approach */
/* Extra small devices (phones, < 576px) */
/* Default styles */

/* Small devices (landscape phones, >= 576px) */
@media (min-width: 576px) { }

/* Medium devices (tablets, >= 768px) */
@media (min-width: 768px) { }

/* Large devices (desktops, >= 992px) */
@media (min-width: 992px) { }

/* Extra large devices (large desktops, >= 1200px) */
@media (min-width: 1200px) { }
```

### 4.2. Responsive Components

```typescript
// React example
const Pipeline: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return isMobile ? (
    <MobilePipelineView />
  ) : (
    <DesktopPipelineView />
  );
};

// Custom hook
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
};
```

### 4.3. Touch Gestures

```typescript
// React Native gesture example
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const DealCard = ({ deal, onDelete, onEdit }) => {
  const swipeGesture = Gesture.Pan()
    .onEnd((e) => {
      if (e.translationX < -100) {
        onDelete(deal.id);
      } else if (e.translationX > 100) {
        onEdit(deal.id);
      }
    });
  
  return (
    <GestureDetector gesture={swipeGesture}>
      <View>{/* Deal content */}</View>
    </GestureDetector>
  );
};
```

## 5. Progressive Web App (PWA) Setup

### 5.1. Service Worker

```javascript
// service-worker.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new BackgroundSyncPlugin('api-queue', {
        maxRetentionTime: 24 * 60 // Retry for 24 hours
      })
    ]
  })
);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);
```

### 5.2. Web Manifest

```json
{
  "name": "SimpleCRM",
  "short_name": "CRM",
  "description": "Sales-driven CRM for managing contacts, deals, and activities",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "New Deal",
      "url": "/deals/new",
      "icon": "/icons/new-deal.png"
    },
    {
      "name": "My Pipeline",
      "url": "/pipeline",
      "icon": "/icons/pipeline.png"
    }
  ]
}
```

### 5.3. Push Notifications

```typescript
// Register push notifications
async function registerPushNotifications() {
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
  });
  
  // Send subscription to server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle push events in service worker
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge.png',
      data: data.url
    })
  );
});
```

## 6. Offline Data Management

### 6.1. IndexedDB for Web

```typescript
import Dexie from 'dexie';

class CRMDatabase extends Dexie {
  deals: Dexie.Table<Deal, number>;
  contacts: Dexie.Table<Contact, number>;
  activities: Dexie.Table<Activity, number>;
  
  constructor() {
    super('SimpleCRM');
    this.version(1).stores({
      deals: '++id, name, stage, value, ownerId, updatedAt',
      contacts: '++id, name, email, companyId, updatedAt',
      activities: '++id, type, dueAt, dealId, contactId, updatedAt'
    });
  }
}

const db = new CRMDatabase();

// CRUD operations
export const dealsStorage = {
  async getAll() {
    return db.deals.toArray();
  },
  
  async add(deal: Deal) {
    return db.deals.add(deal);
  },
  
  async update(id: number, changes: Partial<Deal>) {
    return db.deals.update(id, changes);
  },
  
  async delete(id: number) {
    return db.deals.delete(id);
  }
};
```

### 6.2. AsyncStorage for React Native

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async saveDeals(deals: Deal[]) {
    await AsyncStorage.setItem('deals', JSON.stringify(deals));
  },
  
  async getDeals(): Promise<Deal[]> {
    const data = await AsyncStorage.getItem('deals');
    return data ? JSON.parse(data) : [];
  },
  
  async addOfflineAction(action: OfflineAction) {
    const queue = await this.getOfflineQueue();
    queue.push(action);
    await AsyncStorage.setItem('offline_queue', JSON.stringify(queue));
  },
  
  async getOfflineQueue(): Promise<OfflineAction[]> {
    const data = await AsyncStorage.getItem('offline_queue');
    return data ? JSON.parse(data) : [];
  },
  
  async clearOfflineQueue() {
    await AsyncStorage.removeItem('offline_queue');
  }
};
```

### 6.3. Sync Strategy

```typescript
class SyncManager {
  private syncInProgress = false;
  
  async sync() {
    if (this.syncInProgress) return;
    this.syncInProgress = true;
    
    try {
      // 1. Send offline actions
      await this.syncOfflineActions();
      
      // 2. Fetch updates from server
      await this.fetchUpdates();
      
      // 3. Resolve conflicts
      await this.resolveConflicts();
      
    } finally {
      this.syncInProgress = false;
    }
  }
  
  private async syncOfflineActions() {
    const queue = await storage.getOfflineQueue();
    
    for (const action of queue) {
      try {
        await this.executeAction(action);
        // Remove from queue on success
        queue.splice(queue.indexOf(action), 1);
      } catch (error) {
        action.retryCount++;
        if (action.retryCount > 3) {
          // Mark as failed, notify user
          this.notifyFailedAction(action);
        }
      }
    }
    
    await storage.setOfflineQueue(queue);
  }
  
  private async fetchUpdates() {
    const lastSync = await storage.getLastSyncTime();
    const updates = await api.sync({ since: lastSync });
    
    // Update local storage
    await storage.saveDeals(updates.deals);
    await storage.saveContacts(updates.contacts);
    await storage.setLastSyncTime(new Date());
  }
}
```

## 7. Mobile-Specific Optimizations

### 7.1. Image Optimization

```typescript
// Lazy loading images
<img
  src="placeholder.jpg"
  data-src="actual-image.jpg"
  loading="lazy"
  alt="Deal attachment"
/>

// React Native optimized images
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable
  }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### 7.2. List Virtualization

```typescript
// React Native FlatList
import { FlatList } from 'react-native';

<FlatList
  data={deals}
  renderItem={({ item }) => <DealCard deal={item} />}
  keyExtractor={item => item.id.toString()}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>

// React web virtualization
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={deals.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <DealCard deal={deals[index]} />
    </div>
  )}
</FixedSizeList>
```

### 7.3. Bundle Size Optimization

```javascript
// Webpack configuration
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    usedExports: true,
    minimize: true
  }
};

// Code splitting
const MobilePipeline = lazy(() => import('./components/mobile/MobilePipeline'));

<Suspense fallback={<LoadingSpinner />}>
  <MobilePipeline />
</Suspense>
```

## 8. Native Features Integration

### 8.1. Camera Access (React Native)

```typescript
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

async function captureDocument() {
  const result = await launchCamera({
    mediaType: 'photo',
    quality: 0.8,
    saveToPhotos: false
  });
  
  if (result.assets && result.assets[0]) {
    const image = result.assets[0];
    await uploadDocument(image.uri);
  }
}
```

### 8.2. Biometric Authentication

```typescript
import ReactNativeBiometrics from 'react-native-biometrics';

async function authenticateWithBiometrics() {
  const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();
  
  if (available) {
    const { success } = await ReactNativeBiometrics.simplePrompt({
      promptMessage: 'Authenticate to access SimpleCRM'
    });
    
    return success;
  }
  
  return false;
}
```

### 8.3. Push Notifications (React Native)

```typescript
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

async function setupPushNotifications() {
  // Request permission
  const authStatus = await messaging().requestPermission();
  
  if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
    // Get FCM token
    const token = await messaging().getToken();
    await api.registerPushToken(token);
    
    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      PushNotification.localNotification({
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body
      });
    });
  }
}
```

## 9. Testing Strategy

### 9.1. Unit Tests

```typescript
// Jest test example
describe('DealsService', () => {
  it('should fetch deals from API', async () => {
    const mockDeals = [{ id: 1, name: 'Deal 1' }];
    api.get = jest.fn().mockResolvedValue(mockDeals);
    
    const deals = await dealsService.getAll();
    
    expect(deals).toEqual(mockDeals);
    expect(api.get).toHaveBeenCalledWith('/deals');
  });
  
  it('should handle offline mode', async () => {
    api.get = jest.fn().mockRejectedValue(new Error('Network error'));
    storage.getDeals = jest.fn().mockResolvedValue([{ id: 1 }]);
    
    const deals = await dealsService.getAll();
    
    expect(deals).toHaveLength(1);
    expect(storage.getDeals).toHaveBeenCalled();
  });
});
```

### 9.2. Integration Tests

```typescript
// React Native Testing Library
import { render, fireEvent, waitFor } from '@testing-library/react-native';

describe('PipelineScreen', () => {
  it('should load and display deals', async () => {
    const { getByText, getByTestId } = render(<PipelineScreen />);
    
    await waitFor(() => {
      expect(getByText('Deal 1')).toBeTruthy();
      expect(getByText('Deal 2')).toBeTruthy();
    });
  });
  
  it('should move deal to next stage on swipe', async () => {
    const { getByTestId } = render(<PipelineScreen />);
    const dealCard = getByTestId('deal-card-1');
    
    fireEvent(dealCard, 'onSwipeRight');
    
    await waitFor(() => {
      expect(api.updateDeal).toHaveBeenCalledWith(1, { stage: 'Proposal' });
    });
  });
});
```

### 9.3. E2E Tests

```typescript
// Detox E2E test (React Native)
describe('Mobile CRM Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  
  it('should login and view pipeline', async () => {
    await element(by.id('email-input')).typeText('user@example.com');
    await element(by.id('password-input')).typeText('password');
    await element(by.id('login-button')).tap();
    
    await waitFor(element(by.id('pipeline-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.id('deal-card-1'))).toBeVisible();
  });
  
  it('should create new deal', async () => {
    await element(by.id('add-deal-fab')).tap();
    await element(by.id('deal-name-input')).typeText('New Deal');
    await element(by.id('deal-value-input')).typeText('10000');
    await element(by.id('save-deal-button')).tap();
    
    await expect(element(by.text('New Deal'))).toBeVisible();
  });
});
```

## 10. Deployment Checklist

### 10.1. Pre-Launch Checklist

- [ ] All unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests on real devices passing
- [ ] Performance benchmarks met (Lighthouse 90+)
- [ ] Security audit completed
- [ ] Accessibility audit (WCAG AA)
- [ ] Cross-browser testing (Safari, Chrome, Firefox)
- [ ] Device testing (iOS 14+, Android 8+)
- [ ] Network testing (2G, 3G, 4G, WiFi)
- [ ] Offline mode tested
- [ ] Push notifications tested
- [ ] Biometric auth tested
- [ ] App store assets prepared (screenshots, descriptions)
- [ ] Privacy policy and terms updated
- [ ] Analytics configured
- [ ] Crash reporting configured
- [ ] Beta testing completed

### 10.2. iOS App Store Submission

```
1. Create App ID in Apple Developer Portal
2. Configure App Store Connect
3. Prepare assets:
   - App icon (1024x1024)
   - Screenshots (various sizes)
   - App preview videos (optional)
4. Build and archive app in Xcode
5. Upload to App Store Connect
6. Fill metadata and descriptions
7. Submit for review
8. Monitor review status
```

### 10.3. Google Play Store Submission

```
1. Create app in Google Play Console
2. Configure store listing
3. Prepare assets:
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (various sizes)
4. Build signed APK/AAB
5. Upload to Google Play Console
6. Fill metadata and descriptions
7. Set up pricing and distribution
8. Submit for review
9. Monitor review status
```

## 11. Monitoring & Maintenance

### 11.1. Performance Monitoring

```typescript
// Firebase Performance
import perf from '@react-native-firebase/perf';

async function loadPipeline() {
  const trace = await perf().startTrace('load_pipeline');
  
  try {
    const deals = await api.getDeals();
    await trace.putMetric('deal_count', deals.length);
    return deals;
  } finally {
    await trace.stop();
  }
}
```

### 11.2. Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_DSN',
  environment: __DEV__ ? 'development' : 'production',
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  }
});

// Capture errors
try {
  await api.updateDeal(dealId, changes);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'deal_update' },
    extra: { dealId, changes }
  });
  throw error;
}
```

### 11.3. Analytics

```typescript
// Firebase Analytics
import analytics from '@react-native-firebase/analytics';

// Track screen views
await analytics().logScreenView({
  screen_name: 'Pipeline',
  screen_class: 'PipelineScreen'
});

// Track events
await analytics().logEvent('deal_created', {
  value: dealValue,
  stage: dealStage,
  source: 'mobile'
});

// Set user properties
await analytics().setUserProperty('sales_role', 'representative');
```

## 12. Troubleshooting Common Issues

### 12.1. Performance Issues

**Symptom**: Slow list scrolling
**Solution**: Implement virtualization, reduce item complexity, use `shouldComponentUpdate`

**Symptom**: High memory usage
**Solution**: Clear image caches, limit offline data retention, use pagination

### 12.2. Offline Sync Issues

**Symptom**: Data not syncing
**Solution**: Check network status, verify token validity, review sync queue

**Symptom**: Conflicts on sync
**Solution**: Implement conflict resolution UI, use last-write-wins strategy

### 12.3. Platform-Specific Issues

**iOS**: Keyboard covering inputs
**Solution**: Use `KeyboardAvoidingView` with proper behavior

**Android**: Back button not working
**Solution**: Implement `BackHandler` for custom navigation

## 13. Resources

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design for Android](https://material.io/design)

### Tools
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

### Community
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- [Reddit r/reactnative](https://reddit.com/r/reactnative)

---

*This guide is maintained by the SimpleCRM Development Team. Last updated: 2025-11-10*
