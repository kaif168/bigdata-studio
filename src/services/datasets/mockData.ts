// Rich realistic synthetic datasets for BigData Studio

export interface TableSeedData {
  tableName: string;
  description: string;
  columns: { name: string; type: string }[];
  data: Record<string, any>[];
}

// 1. Dataset A: E-commerce Sales (`sales`)
const categories = ['Electronics', 'Home & Kitchen', 'Footwear', 'Apparel', 'Books', 'Fitness'];
const products: Record<string, { name: string; price: number }[]> = {
  Electronics: [
    { name: 'Quantum Pro Wireless Headphones', price: 149.99 },
    { name: 'UltraHD 4K Curved Monitor', price: 389.50 },
    { name: 'Mechanical Ergonomic Keyboard', price: 119.00 },
    { name: 'Precision Gaming Mouse', price: 69.99 },
    { name: 'Smart Fitness Tracker v4', price: 89.95 },
  ],
  'Home & Kitchen': [
    { name: 'Barista Espresso Machine', price: 299.00 },
    { name: 'Cold Press Slow Juicer', price: 129.50 },
    { name: 'Air Fryer Touch Max', price: 110.00 },
    { name: 'Stainless Cookware Set 10pc', price: 199.99 },
    { name: 'Smart Robot Vacuum Cleaner', price: 249.00 },
  ],
  Footwear: [
    { name: 'AeroCloud Marathon Runners', price: 135.00 },
    { name: 'Apex Trail Waterproof Hiking Boots', price: 175.50 },
    { name: 'Urban Glide Street Sneakers', price: 85.00 },
    { name: 'Classic Leather Loafers', price: 110.00 },
  ],
  Apparel: [
    { name: 'Merino Wool Thermal Sweater', price: 95.00 },
    { name: 'All-Weather Tech Windbreaker', price: 120.00 },
    { name: 'Slim Fit Organic Cotton Chinos', price: 58.00 },
    { name: 'Breathable Training Hoodie', price: 65.00 },
  ],
  Books: [
    { name: 'Designing Data-Intensive Applications', price: 44.99 },
    { name: 'Hadoop: The Definitive Guide', price: 49.50 },
    { name: 'Learning Spark: Lightning-Fast Analytics', price: 42.00 },
    { name: 'SQL for Data Engineering Masterclass', price: 38.00 },
  ],
  Fitness: [
    { name: 'Adjustable Quick-Lock Dumbbells 50lb', price: 299.00 },
    { name: 'Eco-Grip Non-Slip Yoga Mat', price: 45.00 },
    { name: 'Heavy Duty Power Resistance Bands', price: 29.99 },
    { name: 'Speed Ropes Pro Aluminum', price: 19.50 },
  ],
};

const regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East'];
const paymentMethods = ['Credit Card', 'PayPal', 'UPI / Wire', 'Crypto Pay', 'Apple Pay'];

export const generateSalesData = (count = 150): Record<string, any>[] => {
  const rows: Record<string, any>[] = [];
  const startDate = new Date('2024-01-01T00:00:00Z').getTime();
  const endDate = new Date('2024-12-31T23:59:59Z').getTime();

  for (let i = 1; i <= count; i++) {
    const category = categories[i % categories.length];
    const categoryProducts = products[category];
    const product = categoryProducts[(i * 3) % categoryProducts.length];
    const quantity = (i % 5) + 1;
    const unit_price = product.price;
    const amount = Number((quantity * unit_price).toFixed(2));
    const randomTimestamp = startDate + ((i * 1234567) % (endDate - startDate));
    const order_date = new Date(randomTimestamp).toISOString().split('T')[0];
    const region = regions[(i * 7) % regions.length];
    const payment_method = paymentMethods[(i * 11) % paymentMethods.length];

    rows.push({
      order_id: 1000 + i,
      order_date,
      customer_id: `CUST-${String((i % 45) + 1).padStart(3, '0')}`,
      product_id: `PROD-${String((i % 25) + 101)}`,
      product_name: product.name,
      category,
      quantity,
      unit_price,
      amount,
      region,
      payment_method,
    });
  }
  return rows;
};

// 2. Dataset B: Student Performance (`students`)
const departments = ['Computer Science', 'Data Science & AI', 'Information Systems', 'Software Engineering', 'Electronics & Comm'];
const studentNames = [
  'Aarav Sharma', 'Priya Patel', 'Ethan Wright', 'Sophia Chen', 'Liam Johnson',
  'Ananya Iyer', 'Mateo Rossi', 'Zara Khan', 'David Kim', 'Emily Watson',
  'Rohit Verma', 'Grace Liu', 'Noah Miller', 'Fatima Al-Mansoor', 'Lucas Silva',
  'Tanvi Joshi', 'Alexander Brown', 'Mei Ling', 'Hassan Ali', 'Olivia Taylor',
  'Vikram Malhotra', 'Chloe Martin', 'Aditya Nair', 'Emma Davis', 'Daniel Garcia',
  'Sneha Kulkarni', 'James Wilson', 'Kavya Sen', 'Benjamin Clark', 'Rhea Kapoor'
];

export const generateStudentsData = (count = 100): Record<string, any>[] => {
  const rows: Record<string, any>[] = [];
  for (let i = 1; i <= count; i++) {
    const name = studentNames[(i - 1) % studentNames.length] + (i > 30 ? ` Jr.` : '');
    const department = departments[i % departments.length];
    const semester = (i % 8) + 1;
    const attendance_percentage = Number((65 + ((i * 7) % 35)).toFixed(1));
    const assignment_score = Number((50 + ((i * 13) % 48)).toFixed(1));
    const exam_score = Number((45 + ((i * 17) % 53)).toFixed(1));

    rows.push({
      student_id: `STU-${String(202400 + i)}`,
      student_name: name,
      department,
      semester,
      attendance_percentage,
      assignment_score,
      exam_score,
    });
  }
  return rows;
};

// 3. Dataset C: Website Analytics (`web_events`)
const eventTypes = ['page_view', 'add_to_cart', 'purchase', 'search', 'click_cta', 'sign_up'];
const pageNames = ['/home', '/products', '/cart', '/checkout', '/blog/big-data-guide', '/pricing', '/docs'];
const deviceTypes = ['desktop', 'mobile', 'tablet'];

export const generateWebEventsData = (count = 160): Record<string, any>[] => {
  const rows: Record<string, any>[] = [];
  const baseTime = new Date('2024-06-01T08:00:00Z').getTime();

  for (let i = 1; i <= count; i++) {
    const timestamp = new Date(baseTime + i * 420000).toISOString().replace('T', ' ').substring(0, 19);
    const user_id = `USR-${String((i % 38) + 1).padStart(4, '0')}`;
    const event_type = eventTypes[(i * 3) % eventTypes.length];
    const page_name = pageNames[(i * 5) % pageNames.length];
    const device_type = deviceTypes[i % deviceTypes.length];
    const session_duration = (i % 12) * 45 + 15; // in seconds

    rows.push({
      event_id: `EVT-${String(10000 + i)}`,
      event_time: timestamp,
      user_id,
      event_type,
      page_name,
      device_type,
      session_duration,
    });
  }
  return rows;
};

// 4. Dataset D: IoT Sensor Data (`sensor_readings`)
const sensorLocations = ['Server Room A', 'Warehouse Bay 2', 'Cold Storage Unit 1', 'Assembly Line 3', 'Rooftop Weather Node', 'Cleanroom Beta'];
const sensorStatuses = ['OK', 'OK', 'OK', 'WARNING', 'OK', 'ALERT'];

export const generateSensorReadingsData = (count = 150): Record<string, any>[] => {
  const rows: Record<string, any>[] = [];
  const baseTime = new Date('2024-08-15T00:00:00Z').getTime();

  for (let i = 1; i <= count; i++) {
    const sensor_id = `SENSOR-${String((i % 8) + 1).padStart(2, '0')}`;
    const recorded_at = new Date(baseTime + i * 600000).toISOString().replace('T', ' ').substring(0, 19);
    const location = sensorLocations[(i * 2) % sensorLocations.length];
    const baseTemp = location.includes('Cold') ? 4.0 : location.includes('Server') ? 21.0 : 27.5;
    const temperature = Number((baseTemp + ((i % 11) - 5) * 0.8).toFixed(2));
    const humidity = Number((40 + ((i * 9) % 45)).toFixed(1));
    const status = (temperature > 30 || humidity > 80) ? 'ALERT' : sensorStatuses[(i * 3) % sensorStatuses.length];

    rows.push({
      reading_id: 50000 + i,
      sensor_id,
      recorded_at,
      temperature,
      humidity,
      location,
      status,
    });
  }
  return rows;
};

// 5. Dataset E: Retail Transactions (`retail_transactions`)
const storeCities = ['New York', 'London', 'Tokyo', 'San Francisco', 'Berlin', 'Singapore', 'Mumbai'];
const customerSegments = ['Consumer', 'Corporate', 'Small Business', 'VIP Member'];
const retailCategories = ['Office Supplies', 'Furniture', 'Technology', 'Beverages', 'Merchandise'];

export const generateRetailTransactionsData = (count = 140): Record<string, any>[] => {
  const rows: Record<string, any>[] = [];
  const baseDate = new Date('2024-03-01T00:00:00Z').getTime();

  for (let i = 1; i <= count; i++) {
    const store_city = storeCities[i % storeCities.length];
    const customer_segment = customerSegments[(i * 3) % customerSegments.length];
    const product_category = retailCategories[(i * 7) % retailCategories.length];
    const items_count = (i % 8) + 1;
    const discount_rate = Number((((i % 5) * 5) / 100).toFixed(2));
    const gross = (items_count * (25 + ((i * 13) % 150)));
    const net_amount = Number((gross * (1 - discount_rate)).toFixed(2));
    const transaction_date = new Date(baseDate + i * 86400000 * 2).toISOString().split('T')[0];

    rows.push({
      transaction_id: `TXN-${String(7000 + i)}`,
      store_id: `STR-${String((i % 12) + 1).padStart(3, '0')}`,
      store_city,
      customer_segment,
      product_category,
      items_count,
      discount_rate,
      net_amount,
      transaction_date,
    });
  }
  return rows;
};

// 6. Dataset F: Employee Analytics (`employees`)
const empRoles: Record<string, string[]> = {
  Engineering: ['Data Engineer', 'Distributed Systems Architect', 'ML Infrastructure Engineer', 'Database Administrator'],
  Analytics: ['Senior Data Analyst', 'BI Specialist', 'Analytics Consultant', 'Reporting Lead'],
  Product: ['Product Manager - Data Platforms', 'Technical Product Lead', 'Growth Analytics Manager'],
  Operations: ['Cloud Operations Engineer', 'Site Reliability Engineer', 'Systems Operator'],
};
const empCities = ['Seattle', 'Austin', 'Boston', 'Zurich', 'Toronto', 'Sydney', 'Bengaluru'];

export const generateEmployeesData = (count = 100): Record<string, any>[] => {
  const rows: Record<string, any>[] = [];
  const deptKeys = Object.keys(empRoles);
  const hireBase = new Date('2019-01-15T00:00:00Z').getTime();

  for (let i = 1; i <= count; i++) {
    const department = deptKeys[i % deptKeys.length];
    const roleList = empRoles[department];
    const role = roleList[(i * 3) % roleList.length];
    const city = empCities[(i * 5) % empCities.length];
    const baseSalary = department === 'Engineering' ? 125000 : department === 'Product' ? 115000 : 92000;
    const salary = baseSalary + ((i * 2300) % 45000);
    const hire_date = new Date(hireBase + i * 21000000000).toISOString().split('T')[0];
    const performance_rating = Number((3.2 + ((i * 3) % 18) * 0.1).toFixed(1)); // 3.2 to 4.9

    rows.push({
      employee_id: `EMP-${String(300 + i)}`,
      first_name: ['James', 'Elena', 'Rahul', 'Chloe', 'Marcus', 'Aoi', 'Mateo', 'Fatima', 'Kai', 'Seraphina'][i % 10],
      last_name: ['Vance', 'Rostova', 'Kapoor', 'Dupont', 'Abebe', 'Tanaka', 'Santoro', 'Nasser', 'Lindqvist', 'O\'Connor'][(i * 3) % 10],
      department,
      role,
      salary,
      hire_date,
      performance_rating,
      city,
    });
  }
  return rows;
};

export const BUILTIN_DATASETS: TableSeedData[] = [
  {
    tableName: 'sales',
    description: 'E-commerce orders with transaction dates, product details, amounts, categories, and payment types.',
    columns: [
      { name: 'order_id', type: 'INTEGER' },
      { name: 'order_date', type: 'VARCHAR' },
      { name: 'customer_id', type: 'VARCHAR' },
      { name: 'product_id', type: 'VARCHAR' },
      { name: 'product_name', type: 'VARCHAR' },
      { name: 'category', type: 'VARCHAR' },
      { name: 'quantity', type: 'INTEGER' },
      { name: 'unit_price', type: 'DOUBLE' },
      { name: 'amount', type: 'DOUBLE' },
      { name: 'region', type: 'VARCHAR' },
      { name: 'payment_method', type: 'VARCHAR' },
    ],
    data: generateSalesData(),
  },
  {
    tableName: 'students',
    description: 'Academic performance, attendance percentages, assignment and exam scores across college engineering departments.',
    columns: [
      { name: 'student_id', type: 'VARCHAR' },
      { name: 'student_name', type: 'VARCHAR' },
      { name: 'department', type: 'VARCHAR' },
      { name: 'semester', type: 'INTEGER' },
      { name: 'attendance_percentage', type: 'DOUBLE' },
      { name: 'assignment_score', type: 'DOUBLE' },
      { name: 'exam_score', type: 'DOUBLE' },
    ],
    data: generateStudentsData(),
  },
  {
    tableName: 'web_events',
    description: 'High-velocity digital telemetry clickstream events, user sessions, page navigations, and device metrics.',
    columns: [
      { name: 'event_id', type: 'VARCHAR' },
      { name: 'event_time', type: 'VARCHAR' },
      { name: 'user_id', type: 'VARCHAR' },
      { name: 'event_type', type: 'VARCHAR' },
      { name: 'page_name', type: 'VARCHAR' },
      { name: 'device_type', type: 'VARCHAR' },
      { name: 'session_duration', type: 'INTEGER' },
    ],
    data: generateWebEventsData(),
  },
  {
    tableName: 'sensor_readings',
    description: 'Industrial IoT environmental streams with temperature, humidity, facility locations, and anomaly status.',
    columns: [
      { name: 'reading_id', type: 'INTEGER' },
      { name: 'sensor_id', type: 'VARCHAR' },
      { name: 'recorded_at', type: 'VARCHAR' },
      { name: 'temperature', type: 'DOUBLE' },
      { name: 'humidity', type: 'DOUBLE' },
      { name: 'location', type: 'VARCHAR' },
      { name: 'status', type: 'VARCHAR' },
    ],
    data: generateSensorReadingsData(),
  },
  {
    tableName: 'retail_transactions',
    description: 'Omnichannel retail store transactions including customer segmentations, promotional discounts, and net revenues.',
    columns: [
      { name: 'transaction_id', type: 'VARCHAR' },
      { name: 'store_id', type: 'VARCHAR' },
      { name: 'store_city', type: 'VARCHAR' },
      { name: 'customer_segment', type: 'VARCHAR' },
      { name: 'product_category', type: 'VARCHAR' },
      { name: 'items_count', type: 'INTEGER' },
      { name: 'discount_rate', type: 'DOUBLE' },
      { name: 'net_amount', type: 'DOUBLE' },
      { name: 'transaction_date', type: 'VARCHAR' },
    ],
    data: generateRetailTransactionsData(),
  },
  {
    tableName: 'employees',
    description: 'Enterprise workforce analytics with engineering departments, technical roles, annual compensations, and ratings.',
    columns: [
      { name: 'employee_id', type: 'VARCHAR' },
      { name: 'first_name', type: 'VARCHAR' },
      { name: 'last_name', type: 'VARCHAR' },
      { name: 'department', type: 'VARCHAR' },
      { name: 'role', type: 'VARCHAR' },
      { name: 'salary', type: 'INTEGER' },
      { name: 'hire_date', type: 'VARCHAR' },
      { name: 'performance_rating', type: 'DOUBLE' },
      { name: 'city', type: 'VARCHAR' },
    ],
    data: generateEmployeesData(),
  },
];
