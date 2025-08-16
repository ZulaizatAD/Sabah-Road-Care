export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  // Convert to number if it's a string
  const number = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(number)) return '0';
  
  // Format with commas for thousands
  return number.toLocaleString();
};

export const formatCurrency = (amount, currency = 'MYR') => {
  if (amount === null || amount === undefined) return 'RM 0.00';
  
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(number)) return 'RM 0.00';
  
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(number);
};

export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return dateObj.toLocaleDateString('en-MY', { ...defaultOptions, ...options });
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(number)) return '0%';
  
  return `${number.toFixed(decimals)}%`;
};