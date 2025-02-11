export function generateTeacherId(
  firstName: string,
  lastName: string,
  joiningDate: Date,
  totalTeachers: number,
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

  // Generate sequence number based on total teachers
  const sequenceNumber = (totalTeachers + 1).toString().padStart(3, '0');

  // Combine all parts to create teacher ID
  return `${prefix}${sequenceNumber}`;
}
