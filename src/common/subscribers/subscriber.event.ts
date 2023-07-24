import { Activity } from 'src/modules/activity/entities/activity.entity';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { dataSource } from '../database/app-data-source';

@EventSubscriber()
export class Subscriber implements EntitySubscriberInterface {
  async afterUpdate(event: UpdateEvent<any>): Promise<void | any> {
    if (event.entity !== undefined) {
      const newActivity = Activity.create({
        action: 'updated',
        moderator_id: event.entity.moderator_id,
        ref_id: event.entity.id,
        table: event.metadata.targetName,
        action_message: event.entity?.action_message
          ? event.entity?.action_message
          : null,
      });
      const manager = await dataSource;
      const activityRepo = manager.getRepository(Activity);
      await activityRepo.save(newActivity);
    }
  }

  async beforeRemove(event: RemoveEvent<any>): Promise<void | any> {
    if (event.entity !== undefined) {
      const newActivity = Activity.create({
        action: 'removed',
        moderator_id: event.entity.moderator_id,
        ref_id: event.entity.id,
        table: event.metadata.targetName,
        action_message: event.entity?.action_message
          ? event.entity?.action_message
          : null,
      });
      const manager = await dataSource;
      const activityRepo = manager.getRepository(Activity);
      await activityRepo.save(newActivity);

      const refRepo = manager.getRepository(event.metadata.targetName);
      await refRepo.update(newActivity.ref_id, { status: 'removed' });

      const queryRunner = event.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.rollbackTransaction();
    }
  }

  async afterInsert(event: InsertEvent<any>): Promise<void | any> {
    if (event.entity !== undefined) {
      const newActivity = Activity.create({
        action: 'created',
        moderator_id: event.entity.moderator_id,
        ref_id: event.entity.id,
        table: event.metadata.targetName,
        action_message: event.entity?.action_message
          ? event.entity?.action_message
          : null,
      });
      const manager = await dataSource;
      const activityRepo = manager.getRepository(Activity);
      await activityRepo.save(newActivity);
    }
  }
}
