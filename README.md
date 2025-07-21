# ReactJS + Supabase Raporlama Sistemi

Bu proje, personel için veri giriş formu ve admin için grafik görüntüleme sistemi olan bir raporlama uygulamasıdır.

## Özellikler

### Genel
- **Frontend:** ReactJS + TypeScript
- **Backend:** Supabase (Auth + Database)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Routing:** React Router

### Kullanıcı Rolleri
- **Personel:** Kendi verilerini girebilir ve görüntüleyebilir
- **Admin:** Tüm verileri görebilir, kullanıcı rollerini yönetebilir, grafikleri görüntüleyebilir

### Raporlama Modülleri
1. **Sosyal Medya Raporlama**
2. **Basın Haberleri Raporlama**
3. **Web Sitesi Analitiği**
4. **RPA Raporlama**

## Kurulum

### 1. Gereksinimler
- Node.js (v14 veya üzeri)
- Supabase hesabı

### 2. Projeyi Klonlayın
```bash
git clone <repo-url>
cd kmr-app
```

### 3. Bağımlılıkları Yükleyin
```bash
npm install
```

### 4. Supabase Kurulumu

#### 4.1 Supabase Projesi Oluşturun
1. [Supabase](https://supabase.com) hesabı açın
2. Yeni proje oluşturun
3. Project URL ve Anon Key değerlerini kopyalayın

#### 4.2 Environment Dosyası Oluşturun
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### 4.3 Veritabanı Şemalarını Oluşturun
Supabase Dashboard > SQL Editor'da `database_schema.sql` dosyasının içeriğini çalıştırın.

Bu şu işlemleri gerçekleştirir:
- Tabloları oluşturur (profiles, social_media_reports, media_reports, website_analytics, rpa_reports)
- Row Level Security (RLS) kurallarını aktive eder
- Gerekli politikaları tanımlar
- Indexleri oluşturur

### 5. Uygulamayı Başlatın
```bash
npm start
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## Kullanım

### İlk Giriş
1. Kayıt ol sayfasından yeni hesap oluşturun
2. İlk kayıt olan kullanıcı otomatik olarak "personel" rolü alır
3. Admin rolü için Supabase Dashboard'dan manuel olarak rol değişikliği yapmanız gerekir

### Personel Kullanımı
- Dashboard'da 4 farklı rapor tipi için form doldurabilirsiniz
- Sadece kendi verilerinizi görebilirsiniz

### Admin Kullanımı
- Admin panelinde tüm kullanıcıların verilerini görebilirsiniz
- Kullanıcı rollerini değiştirebilirsiniz
- Filtreleme yapabilirsiniz (ay, personel, veri tipi)
- Verileri CSV ve JSON formatında dışa aktarabilirsiniz
- Grafikleri görüntüleyebilirsiniz

## Dosya Yapısı

```
src/
├── components/
│   ├── Auth/
│   │   └── Login.tsx
│   ├── Charts/
│   │   ├── MediaChart.tsx
│   │   └── SocialMediaChart.tsx
│   └── Reports/
│       ├── MediaForm.tsx
│       ├── RPAForm.tsx
│       ├── SocialMediaForm.tsx
│       └── WebAnalyticsForm.tsx
├── pages/
│   ├── Admin.tsx
│   └── Dashboard.tsx
├── services/
│   └── supabase.ts
├── App.tsx
└── index.tsx
```

## Veritabanı Yapısı

### Tablolar
- `profiles` - Kullanıcı profilleri ve rolleri
- `social_media_reports` - Sosyal medya raporları
- `media_reports` - Basın haberleri raporları  
- `website_analytics` - Web analitik raporları
- `rpa_reports` - RPA raporları

### RLS Politikaları
- Personel sadece kendi verilerini görebilir/ekleyebilir
- Admin tüm verileri görebilir ve kullanıcı rollerini yönetebilir

## Geliştirme

### Yeni Rapor Tipi Ekleme
1. Supabase'de yeni tablo oluşturun
2. `services/supabase.ts`'de interface tanımlayın
3. `components/Reports/` klasöründe form komponenti oluşturun
4. `components/Charts/` klasöründe grafik komponenti oluşturun
5. Dashboard ve Admin sayfalarına ekleyin

### Deployment
1. Build almak için: `npm run build`
2. Vercel, Netlify gibi platformlarda deploy edebilirsiniz
3. Environment değişkenlerini production ortamında tanımlamayı unutmayın

## Teknolojiler
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend as a Service
- **Recharts** - Data Visualization
- **React Router** - Routing

## Lisans
MIT
