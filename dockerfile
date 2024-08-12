# استخدم الصورة الأساسية لـ Node.js
FROM node:14

# قم بتحديد مجلد العمل في الحاوية
WORKDIR /usr/src/app

# انسخ package.json و package-lock.json إلى مجلد العمل
COPY package*.json ./

# قم بتثبيت التبعيات
RUN npm install

# انسخ بقية ملفات التطبيق إلى مجلد العمل
COPY . .

# كشف المنفذ الذي يعمل عليه التطبيق
EXPOSE 3000

# الأمر لتشغيل التطبيق
CMD ["node", "index.js"]
