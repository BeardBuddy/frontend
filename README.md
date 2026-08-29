# BeardBuddy — Barbershop Appointment System

A full-stack barbershop management system built with Next.js and TypeScript. Customers can browse barbers, book appointments with optional extras, submit reviews, and manage their visit history. All data is persisted in a local SQLite database and seeded automatically on first start.

## Commands

Install dependencies (first time only):

```bash
npm install
```

Production build and start:

```bash
npm run build
npm run start
```

The app runs on [http://localhost:3000](http://localhost:3000).



// 1. давай вот что. use cases + флоу аппоинтов
// 2. проверить что бы данные были сконструированны таким образом что я могу обьяснить: 
сервисы и барьеры (1 сервис - 1 барбер) result: 14:00 classic scissors cut elena rostova / marcus vance; hot towel royal shave viktor kael 
// выбрать время вне рамоk 1 барбера и в рамках 2, result: 17:30 monday classic scissors - no Leo Sterling. tuesday 17:30 classic beard trim - Viktor Kael appears
//    1 аппоинт с екстра и 1 без result: monday 13:00 high fade markus vance with extra and classic scissor at 15:30 with Leo Sterling without extras
//    оставить ревью на 1 аппоинте: added button for forsing completed status
//    1 cancel и создать в то же время тот же сервис тот же барбер result: 2026-06-16 10:30 — 11:15 high skin with elena rostova. 