import { User } from "../../entity/User";

export interface UserDto {
  name: string;
  id: string;
}

export function toUserDto(user: User): UserDto {
  return {
    name: user.name(),
    id: user.id(),
  };
}
