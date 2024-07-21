import { track, tag } from '@prisma/client';

type TItem = track & { tags: tag[] }

export default TItem;