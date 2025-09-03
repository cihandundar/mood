# Supabase Kurulum Rehberi

Bu proje için Supabase'i şu şekilde yapılandırmanız gerekiyor:

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) sitesine gidin
2. Yeni bir proje oluşturun
3. Proje URL'sini ve anonim anahtarını not edin

## 2. Environment Variables

Proje kök dizininde `.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Supabase Dashboard Ayarları

### Authentication > Settings > Email Auth

Aşağıdaki ayarları **KAPATIN**:

- ✅ **Enable email confirmations** - KAPATIN
- ✅ **Enable email change confirmations** - KAPATIN  
- ✅ **Secure email change** - KAPATIN
- ✅ **Enable double confirm changes** - KAPATIN

### Authentication > Settings > General

- **Site URL**: `http://localhost:3000` (geliştirme için)
- **Redirect URLs**: `http://localhost:3000/**`

## 4. Veritabanı Tabloları

Aşağıdaki SQL komutlarını Supabase SQL Editor'da çalıştırın:

```sql
-- Mood entries tablosu
CREATE TABLE mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_type TEXT NOT NULL,
  emoji TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) politikaları
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi mood kayıtlarını görebilir
CREATE POLICY "Users can view own mood entries" ON mood_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi mood kayıtlarını ekleyebilir
CREATE POLICY "Users can insert own mood entries" ON mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar sadece kendi mood kayıtlarını güncelleyebilir
CREATE POLICY "Users can update own mood entries" ON mood_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi mood kayıtlarını silebilir
CREATE POLICY "Users can delete own mood entries" ON mood_entries
  FOR DELETE USING (auth.uid() = user_id);
```

## 5. Test Etme

Artık kullanıcılar:
- Herhangi bir email adresi ile kayıt olabilir (örn: `test@test.com`, `random@fake.com`)
- Email doğrulaması olmadan direkt giriş yapabilir
- Rastgele email adresleri kullanabilir

## Not

Bu ayarlar sadece geliştirme/test ortamı için uygundur. Prodüksiyon ortamında güvenlik için email doğrulamasını açmanız önerilir.
