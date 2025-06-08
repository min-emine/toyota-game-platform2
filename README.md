1. **Gerekli Bağımlılıkları Yükleyin**:
   - Proje dizininde aşağıdaki komutları çalıştırarak bağımlılıkları yükleyin:

     ```bash
     npm install
     npm run start


     ```
2. **Sunucuyu Başlatın**:
   - Sunucu, `server.js` dosyası üzerinden çalıştırılır. Aşağıdaki komut ile başlatabilirsiniz:
     ```bash
     node server.js

     ```

3. **İstemciyi Başlatın**:
   - İstemci, `oyun-merkezi` paketinde çalıştırılır. Aşağıdaki komut ile başlatabilirsiniz:
     ```bash
     npm run start
     ```


4. **Erişim**:
   - Tarayıcınızda `http://localhost:3000` adresine giderek projeyi görüntüleyebilirsiniz.



## **Proje Özellikleri**

### **1. Kullanıcı Girişi ve Kaydı**
- Kullanıcılar e-posta, şifre, kullanıcı adı ve avatar seçerek kayıt olabilir.
- Giriş yapan kullanıcılar, daha önce kaydedilmiş bilgileriyle hızlı giriş yapabilir.
- "Beni Hatırla" özelliği ile kullanıcı bilgileri kaydedilir.

### **2. Lobi Yönetimi**
- Kullanıcılar yeni lobiler oluşturabilir.
- Mevcut lobiler listelenir ve kullanıcılar bu lobilere katılabilir veya çıkabilir.
- Lobi katılımcıları gerçek zamanlı olarak güncellenir.
- Lobilerdeki kullanıcılar arasında gerçek zamanlı sohbet yapılabilir.

### **3. Oyun Detayları ve Oyun Sayfası**
- "Game Details" sayfasında oyun bilgileri görüntülenir.
- Kullanıcılar "Oyuna Git" butonu ile oyun sayfasına yönlendirilir.

### **4. Tema Desteği**
- Kullanıcılar karanlık ve aydınlık mod arasında geçiş yapabilir.
- Tema durumu, kullanıcı oturumu boyunca korunur.

## **Sayfa Rehberi**

### **1. Login Sayfası**
- Kullanıcılar giriş yapabilir veya kayıt olabilir.
- Avatar seçimi ve "Beni Hatırla" özelliği desteklenir.
- Daha önce giriş yapmış kullanıcılar hızlı giriş yapabilir.

### **2. Home Sayfası**
- Kullanıcı adı ve avatar bilgisi üst kısımda gösterilir.
- Lobiler listelenir ve kullanıcılar lobilere katılabilir veya çıkabilir.
- Sol tarafta bir sohbet paneli bulunur. Sohbet paneli açılıp kapatılabilir.
- Oyun kartları hover efekti ile arka plan değişimi sağlar.

### **3. Game Details Sayfası**
- Seçilen oyunun detayları (isim, görsel, açıklama) gösterilir.
- Kullanıcılar "Oyuna Git" butonu ile oyun sayfasına yönlendirilir.


## **Henüz Geliştirilmemiş Özellikler**
- **Online Oynanabilir Tombala**:
  - Aynı lobideki kullanıcıların gerçek zamanlı olarak tombala oynayabilmesi.
  - WebSocket ile çekilen numaraların ve kullanıcı durumlarının paylaşılması.
  - Kullanıcılara rastgele tombala kartları atanması ve kazananın belirlenmesi.
- **Genel Görsel Tasarım**:
  - Projenin görsel tasarımının iyileştirilmesi.


## **Teknik Detaylar**

### **1. Kullanılan Teknolojiler**
- **Frontend**: React, Material-UI, React Router
- **Backend**: Node.js, Express, WebSocket
- **Veri Depolama**: JSON dosyaları (`users.json`, `lobbies.json`)
- **Gerçek Zamanlı İletişim**: WebSocket

### **2. Proje Yapısı**
- **Lerna Monorepo**:
  - Proje, `lerna` kullanılarak monorepo yapısında organize edilmiştir.
  - `packages/oyun-merkezi`: İstemci uygulaması.
  - `server.js`: Sunucu uygulaması.



## **Geliştirici Notları**
- Proje, `vite` ile geliştirilmiştir ve hızlı bir geliştirme ortamı sunar.
- WebSocket entegrasyonu ile gerçek zamanlı özellikler desteklenir.
- Kullanıcı verileri güvenli bir şekilde SHA-256 ile hashlenerek saklanır.