export function getStudentsNavLabel(groupLessonsEnabled: boolean): string {
  return groupLessonsEnabled ? 'Students & Groups' : 'Students';
}
