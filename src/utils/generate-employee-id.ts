export function generateEmployeeId(
  firstName: string,
  lastName: string,
  joiningDate: Date,
  totalEmployees: number,
): string {
  // Get first characters of first and last name
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();

  // Format date components
  const year = joiningDate.getFullYear().toString().slice(-2);
  const month = (joiningDate.getMonth() + 1).toString().padStart(2, '0');
  const day = joiningDate.getDate().toString().padStart(2, '0');

  // Create the base prefix
  const prefix = `${firstInitial}${lastInitial}${year}${month}${day}`;

  // Generate sequence number based on total employees
  const sequenceNumber = (totalEmployees + 1).toString().padStart(3, '0');

  // Combine all parts to create employee ID
  return `${prefix}${sequenceNumber}`;
}
