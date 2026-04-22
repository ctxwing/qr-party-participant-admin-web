/**
 * 닉네임 유효성 검사 및 비즈니스 로직
 */

export const MAX_NICKNAME_LENGTH = 12;
export const MAX_CHANGE_COUNT = 3;

export interface NicknameValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * 닉네임 기본 유효성 검사 (형식 위주)
 */
export function validateNicknameFormat(nickname: string): NicknameValidationResult {
  const trimmed = nickname.trim();
  
  if (!trimmed) {
    return { isValid: false, message: "닉네임을 입력해주세요." };
  }
  
  if (trimmed.length > MAX_NICKNAME_LENGTH) {
    return { isValid: false, message: `닉네임은 최대 ${MAX_NICKNAME_LENGTH}자까지 가능합니다.` };
  }
  
  // 간단한 특수문자 제한 (공백 포함 허용, 특수문자 일부 제한)
  const regex = /^[a-zA-Z0-9가-힣\s]+$/;
  if (!regex.test(trimmed)) {
    return { isValid: false, message: "닉네임에 특수문자를 사용할 수 없습니다." };
  }

  return { isValid: true, message: "사용 가능한 형식입니다." };
}

/**
 * 변경 횟수 제한 체크
 */
export function canChangeNickname(currentCount: number): boolean {
  return currentCount < MAX_CHANGE_COUNT;
}
