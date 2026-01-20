import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export function ToObjectId() {
  return Transform(
    ({ value }) => {
      if (!value) return value;
      
      if (value instanceof Types.ObjectId) {
        return value;
      }
      
      if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
        return new Types.ObjectId(value);
      }
      
      return value;
    },
    { toClassOnly: true }
  );
}
