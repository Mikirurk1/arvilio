import { stripNativeValidationProps } from './strip-native-validation';

describe('stripNativeValidationProps', () => {
  it('removes HTML constraint attributes', () => {
    const input = {
      id: 'email',
      type: 'email',
      required: true,
      minLength: 8,
      maxLength: 100,
      min: 0,
      max: 10,
      pattern: '[a-z]+',
      step: 1,
      value: 'a@b.c',
    };
    expect(stripNativeValidationProps(input)).toEqual({
      id: 'email',
      type: 'email',
      value: 'a@b.c',
    });
  });
});
