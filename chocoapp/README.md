# 🍫 Choco Pickup — Full-Stack MVP

**Chocolate & Ice Cream Pickup App**  
Backend: Django + DRF + PostgreSQL | Mobile: Ionic React + Capacitor (Android)

---

## Project Structure

```
chocoapp/
├── backend/                    # Django REST API
│   ├── chocoapi/               # Core Django config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── accounts/           # Custom User model + JWT auth
│   │   ├── products/           # Product catalog + inventory
│   │   └── orders/             # Order lifecycle
│   ├── manage.py
│   ├── requirements.txt
│   └── Procfile
│
└── frontend/                   # Ionic React App
    ├── src/
    │   ├── pages/              # All app screens
    │   ├── components/         # Reusable UI components
    │   ├── services/           # API service layer (Axios)
    │   ├── context/            # AuthContext + CartContext
    │   ├── types/              # TypeScript interfaces
    │   └── theme/              # CSS variables (chocolate theme)
    ├── capacitor.config.ts
    ├── package.json
    └── vite.config.ts
```

---

## API Reference

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register/` | Public | Register customer |
| POST | `/api/auth/login/` | Public | Login → JWT tokens |
| POST | `/api/auth/refresh/` | Public | Refresh access token |
| POST | `/api/auth/logout/` | Auth | Blacklist refresh token |
| GET/PATCH | `/api/auth/me/` | Auth | Get/update profile |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products/` | Customer | List available products |
| GET | `/api/products/<id>/` | Customer | Product detail |
| GET/POST | `/api/products/admin/` | Admin | List/create products |
| GET/PATCH/DELETE | `/api/products/admin/<id>/` | Admin | Manage product |
| GET | `/api/products/admin/inventory/` | Admin | Stock summary |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET/POST | `/api/orders/` | Customer | List/create orders |
| GET | `/api/orders/<id>/` | Customer | Order detail |
| POST | `/api/orders/<id>/cancel/` | Customer | Cancel pending order |
| GET | `/api/orders/admin/` | Admin | All orders (filter by ?status=PENDING) |
| PATCH | `/api/orders/admin/<id>/review/` | Admin | Approve/reject |
| PATCH | `/api/orders/admin/<id>/complete/` | Admin | Mark completed |

---

## Backend Setup

### Local Development

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate       # macOS/Linux
# venv\Scripts\activate        # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create .env file
cp .env.example .env
# Edit .env with your database credentials

# 4. Run migrations
python manage.py makemigrations
python manage.py migrate

# 5. Create admin user
python manage.py shell -c "
from apps.accounts.models import User
User.objects.create_superuser(email='admin@shop.com', password='admin123', role='admin', first_name='Shop', last_name='Admin')
"

# 6. Run dev server
python manage.py runserver
```

### Environment Variables (.env)
```env
DEBUG=True
SECRET_KEY=your-super-secret-key
DB_NAME=chocoapp
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:8100,http://localhost:3000
```

---

## Frontend Setup

### Local Development

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env
echo "VITE_API_URL=http://localhost:8000/api" > .env

# 3. Run dev server
npm run dev
# Opens at http://localhost:5173
```

---

## Android Build Process (Step-by-Step)

### Step 1: Install Prerequisites
```bash
# Install Android Studio: https://developer.android.com/studio
# Install JDK 17: https://adoptium.net/
# Set ANDROID_HOME environment variable

export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Step 2: Build the Web App
```bash
cd frontend

# Point to production API
echo "VITE_API_URL=https://your-api-domain.com/api" > .env.production

# Build
npm run build
```

### Step 3: Add Capacitor Android
```bash
# Add Android platform
npx cap add android

# Sync web build to Android
npx cap sync android
```

### Step 4: Configure App Identity
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">Choco Pickup</string>
</resources>
```

Edit `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        applicationId "com.chocopickup.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

### Step 5: Add App Icon & Splash Screen
```bash
# Install Capacitor assets tool
npm install -g @capacitor/assets

# Place your icon at resources/icon.png (1024x1024)
# Place splash at resources/splash.png (2732x2732)
npx capacitor-assets generate
```

### Step 6: Generate Signed Release APK/AAB

#### Create Keystore (do this ONCE, store securely)
```bash
keytool -genkeypair \
  -v \
  -keystore chocopickup-release.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias chocopickup \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Choco Pickup, OU=Mobile, O=YourCompany, L=Kano, ST=Kano, C=NG"

# IMPORTANT: Back up this .jks file. Losing it = can't update your app on Play Store.
```

#### Configure Signing in Gradle
Create `android/keystore.properties` (do NOT commit to git):
```properties
storeFile=../chocopickup-release.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=chocopickup
keyPassword=YOUR_KEY_PASSWORD
```

Edit `android/app/build.gradle` to add signing config:
```gradle
def keystoreProps = new Properties()
def keystorePropsFile = rootProject.file('keystore.properties')
if (keystorePropsFile.exists()) {
    keystoreProps.load(new FileInputStream(keystorePropsFile))
}

android {
    signingConfigs {
        release {
            storeFile file(keystoreProps['storeFile'])
            storePassword keystoreProps['storePassword']
            keyAlias keystoreProps['keyAlias']
            keyPassword keystoreProps['keyPassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### Build Release AAB (for Play Store)
```bash
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

#### Build Release APK (for direct install)
```bash
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Step 7: Open in Android Studio
```bash
npx cap open android
# Then Build > Generate Signed Bundle/APK from Android Studio UI
```

---

## Google Play Store Listing

### Required Assets
- **App icon**: 512×512 PNG
- **Feature graphic**: 1024×500 PNG  
- **Screenshots**: Minimum 2, max 8 per device type (phone, tablet)
- **Privacy policy URL**: Required (host a simple page)

### App Description Template
```
Title: Choco Pickup

Short Description (80 chars):
Order premium chocolates & ice cream for easy pickup. Fresh daily!

Full Description:
Choco Pickup is your direct connection to [Shop Name]'s handcrafted chocolates 
and artisan ice cream. Browse our full menu, place your order, and pick it up 
when it's ready — no waiting in line!

Features:
• Browse our full catalog of chocolates and ice cream flavors
• Place pickup orders with real-time status updates  
• Get notified when your order is approved and ready
• View your complete order history
• Simple, fast checkout

How it works:
1. Browse our menu and add items to cart
2. Place your order with one tap
3. Our team reviews and approves your order
4. Come in and pick up your treats!

Perfect for gifting, events, or your daily chocolate fix. 🍫
```

### Privacy Policy Template
Host this at your domain (required by Play Store):
```
Privacy Policy for Choco Pickup

Last updated: [Date]

We collect: email address, name, phone number, and order history.
We use this data to: process orders and communicate order status.
We do not sell your data to third parties.
Data is stored securely on encrypted servers.
Contact: privacy@yourshop.com
```

---

## Production Deployment

### Backend on Render.com

1. Push backend code to GitHub repo
2. Create new **Web Service** on Render
3. Configure:
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `gunicorn chocoapi.wsgi:application`
4. Add Environment Variables in Render dashboard:
   ```
   DEBUG=False
   SECRET_KEY=<generate-strong-key>
   DATABASE_URL=<render-postgres-url>
   ALLOWED_HOSTS=your-app.onrender.com
   CORS_ALLOWED_ORIGINS=https://your-app.onrender.com
   ```
5. Create a PostgreSQL database in Render and link it

### Generate Strong Secret Key
```python
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

### Point Mobile App to Production
```bash
# frontend/.env.production
VITE_API_URL=https://your-api.onrender.com/api
```

---

## Security Checklist

- [x] JWT auth with token rotation and blacklisting
- [x] Email-based auth (no username enumeration via email field)
- [x] Server-side price snapshots (frontend price never trusted)
- [x] Atomic stock deduction with `select_for_update()` 
- [x] Stock validation at order creation AND approval
- [x] Role-based permissions on all endpoints
- [x] Input validation via DRF serializers
- [x] CORS configured for specific origins
- [x] `DEBUG=False` in production
- [x] WhiteNoise for static files (no nginx needed for static)
- [ ] Rate limiting on login (add `django-ratelimit` to login view)
- [ ] HTTPS (handled by Render/VPS automatically)

---

## Phase 2 Roadmap (Not Yet Implemented)

- 💬 **Chat**: Customer ↔ Admin real-time messaging (WebSockets/Django Channels)
- 💳 **Payments**: Paystack/Flutterwave integration
- 🔔 **Push Notifications**: Firebase Cloud Messaging via Capacitor
- 📊 **Analytics Dashboard**: Sales charts, revenue tracking
- 📱 **iOS Build**: Add Capacitor iOS target
- 🎁 **Loyalty System**: Points, rewards, promo codes
