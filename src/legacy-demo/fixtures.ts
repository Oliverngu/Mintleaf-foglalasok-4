import { seed, Timestamp } from './firestore';
import type { User, Unit, Shift, Booking, Request, Todo } from '../core/models/data';
export const unit: Unit = { id: 'legacy-unit', name: 'MintLeaf Demo Café' };
export const users: User[] = [
  ['legacy-manager', 'Minta', 'Olivér', 'Üzletvezető', 'Admin'],
  ['legacy-anna', 'Minta', 'Anna', 'Felszolgáló', 'User'],
  ['legacy-eszter', 'Teszt', 'Eszter', 'Pultos', 'User'],
  ['legacy-daniel', 'Teszt', 'Dániel', 'Felszolgáló', 'User'],
  ['legacy-bence', 'Minta', 'Bence', 'Pultos', 'User'],
].map(([id,lastName,firstName,position,role]) => ({ id, name: id, lastName, firstName, fullName: `${lastName} ${firstName}`, email: `${id}@example.invalid`, position, role: role as User['role'], unitIds: [unit.id] }));
export const manager = users[0];
const monday = new Date(); monday.setHours(0,0,0,0); monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
const at = (offset: number, hour: number) => { const date = new Date(monday); date.setDate(date.getDate()+offset); date.setHours(hour,0,0,0); return Timestamp.fromDate(date); };
export const shifts: Shift[] = [];
for(let day = -7; day < 21; day++) users.forEach((user,index) => {
  if ((day + index + 70) % 5 === 0) return;
  for(const status of ['published','draft'] as const) shifts.push({ id: `legacy-shift-${day}-${index}-${status}`, userId:user.id, userName:user.fullName, position:user.position!, unitId:unit.id, start:at(day,index % 2 ? 14 : 10), end:at(day,index % 2 ? 22 : 18), status });
});
export const bookings: Booking[] = [];
const todayOffset = (new Date().getDay()+6)%7;
for(let day = -7; day < 21; day++) for(let n=0;n<3;n++) bookings.push({ id:`legacy-booking-${day}-${n}`, unitId:unit.id, name:['Minta család','Demo baráti társaság','Teszt vendégek'][n], headcount:[4,6,2][n], occasion:['Vacsora','Születésnap','Találkozó'][n], startTime:at(day,16+n*2), endTime:at(day,18+n*2), status:n===1?'pending':'confirmed', createdAt:Timestamp.now(), notes:n===1?'Fiktív foglalás – ablak melletti asztal.':'Kizárólag bemutató adat.', email:'guest@example.invalid' });
export const requests: Request[] = [{ id:'legacy-request', userId:users[2].id, userName:users[2].fullName, unitId:unit.id, startDate:at(todayOffset+2,0), endDate:at(todayOffset+2,23), status:'approved', note:'Minta szabadnap', createdAt:Timestamp.now() }];
export const todos: Todo[] = [{ id:'legacy-todo', text:'Hűtők leltárazása (minta)', isDone:false, createdBy:manager.fullName, createdByUid:manager.id, createdAt:Timestamp.now(), unitId:unit.id, seenBy:[manager.id] }];
seed(`units/${unit.id}`,unit);
users.forEach(user=>seed(`users/${user.id}`,user));
shifts.forEach(shift=>seed(`shifts/${shift.id}`,shift));
bookings.forEach(booking=>seed(`units/${unit.id}/reservations/${booking.id}`,booking));
requests.forEach(request=>seed(`requests/${request.id}`,request));
todos.forEach(todo=>seed(`todos/${todo.id}`,todo));
['Üzletvezető','Pultos','Felszolgáló'].forEach((name,i)=>seed(`positions/legacy-position-${i}`,{ name, unitId:unit.id }));
seed(`reservation_settings/${unit.id}`,{ blackoutDates:[], dailyCapacity:60, bookableWindow:{ from:'10:00',to:'22:00' }, reservationMode:'request' });
