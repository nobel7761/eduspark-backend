import { ClassCode } from '../enums/class-code.enum';

export function generateStudentId(
  totalStudents: number,
  classValue: string,
): string {
  console.log('generateStudentId', classValue);
  const currentYear = new Date().getFullYear().toString().slice(-2);
  let classCode: string;
  let numericClass: string | undefined;

  switch (classValue.toLowerCase()) {
    case 'arabic':
      classCode = ClassCode.ARABIC;
      break;
    case 'spoken english':
      classCode = ClassCode.SPOKEN_ENGLISH;
      break;
    case 'drawing':
      classCode = ClassCode.DRAWING;
      break;
    default:
      numericClass = classValue.match(/\d+/)?.[0];
      if (!numericClass) {
        throw new Error('Invalid class value');
      }
      classCode = numericClass.padStart(2, '0');
  }

  // Find the last student ID for this year and class
  const prefix = `${currentYear}${classCode}`;

  const sequenceNumber = (totalStudents + 1).toString().padStart(4, '0');

  return `${prefix}${sequenceNumber}`;
}
