const express=require('express'); const env=require('./src/environment'); const natsMgr=require('./src/utils/natsConnectionManager');
const restaurantRoutes=require('./src/routes/restaurantRoutes');
const workDayRoutes=require('./src/routes/workDayRoutes');
const workHoursRoutes=require('./src/routes/workHoursRoutes');
const scheduleRoutes=require('./src/routes/restaurantScheduleRoutes');
const foodItemRoutes=require('./src/routes/foodItemRoutes');
const orderRoutes=require('./src/routes/restaurantOrderRoutes');
const errorHandler=require('./src/middlewares/errorHandler');
async function start(){
  const app=express(); app.use(express.json());
  await natsMgr.connect(); // load subscriber
  app.use('/restaurants', restaurantRoutes);
  app.use('/work-days', workDayRoutes);
  app.use('/work-hours', workHoursRoutes);
  app.use('/schedules', scheduleRoutes);
  app.use('/menu', foodItemRoutes);
  app.use('/orders', orderRoutes);
  app.use(errorHandler);
  app.listen(env.PORT,()=>console.log(`Listening on ${env.PORT}`));
}
start().catch(e=>{console.error(e);process.exit(1);});