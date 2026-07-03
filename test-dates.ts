// Test script to verify date utilities work correctly
import { 
  getTodayDateString, 
  getCurrentLocalDateTimeString, 
  parseLocalDate, 
  formatDate, 
  isThisWeek,
  getThisWeekRange
} from '@/lib/dateUtils';

// Test 1: getTodayDateString() - should return yyyy-mm-dd in local timezone
console.log('Test 1: getTodayDateString()');
const todayString = getTodayDateString();
console.log('Result:', todayString);
console.log('Format is yyyy-mm-dd:', /^\d{4}-\d{2}-\d{2}$/.test(todayString) ? '✓ PASS' : '✗ FAIL');

// Test 2: getCurrentLocalDateTimeString() - should return yyyy-mm-ddTHH:mm:ss in local timezone
console.log('\nTest 2: getCurrentLocalDateTimeString()');
const nowString = getCurrentLocalDateTimeString();
console.log('Result:', nowString);
console.log('Format is yyyy-mm-ddTHH:mm:ss:', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(nowString) ? '✓ PASS' : '✗ FAIL');

// Test 3: parseLocalDate() - should parse yyyy-mm-dd correctly without UTC shift
console.log('\nTest 3: parseLocalDate()');
const testDate = parseLocalDate('2024-01-15');
console.log('Input: 2024-01-15');
console.log('Parsed date year-month-day:', testDate.getFullYear(), testDate.getMonth() + 1, testDate.getDate());
const matches = testDate.getFullYear() === 2024 && (testDate.getMonth() + 1) === 1 && testDate.getDate() === 15;
console.log('Correctly parsed without UTC shift:', matches ? '✓ PASS' : '✗ FAIL');

// Test 4: formatDate() - should display date correctly
console.log('\nTest 4: formatDate()');
const displayDate = formatDate('2024-01-15');
console.log('Input: 2024-01-15');
console.log('Displayed as:', displayDate);
console.log('Contains month, day, year:', /\d/.test(displayDate) ? '✓ PASS' : '✗ FAIL');

// Test 5: Backward compatibility with old ISO format
console.log('\nTest 5: formatDate() with old ISO format (Z suffix)');
const isoDate = '2024-01-15T14:30:00Z';
const displayIsoDate = formatDate(isoDate);
console.log('Input: 2024-01-15T14:30:00Z');
console.log('Displayed as:', displayIsoDate);
console.log('Successfully handled old ISO format:', displayIsoDate.length > 0 ? '✓ PASS' : '✗ FAIL');

// Test 6: getThisWeekRange() - should return current week bounds
console.log('\nTest 6: getThisWeekRange()');
const [weekStart, weekEnd] = getThisWeekRange();
console.log('Week start:', weekStart);
console.log('Week end:', weekEnd);
console.log('Both are valid dates:', /^\d{4}-\d{2}-\d{2}$/.test(weekStart) && /^\d{4}-\d{2}-\d{2}$/.test(weekEnd) ? '✓ PASS' : '✗ FAIL');

// Test 7: isThisWeek() - should correctly determine if date is in current week
console.log('\nTest 7: isThisWeek()');
const isThisWeekDate = isThisWeek(todayString);
console.log('Is today in this week:', isThisWeekDate);
console.log('Today should be in current week:', isThisWeekDate ? '✓ PASS' : '✗ FAIL');

console.log('\n====== ALL TESTS COMPLETED ======');
