import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

// Example User type - adjust based on your actual types
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  isActive: boolean;
}

export const userFactory = Factory.define<User>(() => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  createdAt: faker.date.past(),
  isActive: true,
}));

export default userFactory;
