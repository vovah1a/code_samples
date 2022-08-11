import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as config from 'config';
import * as nodeSchedule from 'node-schedule';
import { Connection } from 'typeorm';

import { kue, queue } from '../../../common/queue';
import { CustomHttpException } from '../../../common/custom-http-exception';
import { cronTypeEnum } from '../../../common/enum/cronType.enum';
import { CronType } from '../../../entity/CronType';
import { PrioritiesTask } from '../../../entity/PrioritiesTask';
import { SchedulerData } from '../../../entity/SchedulerData';
import { CreateQueueDto } from './dto/createQueue.dto';
import { CreateTaskDto } from './dto/createTask.dto';
import { StartTaskDto } from './dto/startTask.dto';
import { LoggerService } from '../../_shared/logger/services/logger.service';
import { LogErrorCodesEnum } from '../../_shared/logger/enums/log-codes.enum';
import moment = require('moment');

const TTL_SAVE_COMPLETE_TASK = config.get('scheduler.ttl_save_complete_task');
const TTL_SAVE_ERROR_TASK = config.get('scheduler.ttl_save_error_task');
const ENV = process.env.NODE_ENV || 'develop';

@Injectable()
export class SchedulerService {
    private readonly yearValue = 15768000;
    private readonly monthValue = 43200;
    private readonly dayValue = 1440;
    private readonly hourValue = 60;
    private readonly entityManager = this.connection.createEntityManager();
    private readonly logger = this.loggerService.create();

    constructor(
        private readonly connection: Connection,
        private readonly loggerService: LoggerService,
    ) {}

    public async createQueue({
      task,
      attempts,
      ttl,
      repeatDelay,
      success,
      cbError,
      cbErrorAttempts,
    }: CreateQueueDto) {
        const { code, prioritiesTask, cronType, interval } = task;

        const taskName = this.getTaskName(code);

        const job = queue.create(taskName, { data: task }).priority(prioritiesTask.code);

        if (ttl) {
            job.ttl(ttl);
        }

        if (interval && !ttl) {
            job.ttl(interval * 60 * 1000);
        }

        if (attempts) {
            job.attempts(attempts);
        }

        if (repeatDelay) {
            job.backoff({ delay: repeatDelay, type: 'fixed' });
        }

        job.save();

        job.on('complete', async (result: any) => {
            this.clearJobs('complete', TTL_SAVE_COMPLETE_TASK);
            await this.saveJobResult(code, true);

            if (cronType.code === cronTypeEnum.ONCE) {
                await this.disableTask(code);
            }

            if (success) {
                success(result);
            }
        });

        job.on('failed attempt', (error: any, doneAttempts: any) => {
            if (cbErrorAttempts) {
                cbErrorAttempts(error, doneAttempts);
            }
        });

        job.on('failed', async (result: any) => {
            this.clearJobs('failed', TTL_SAVE_ERROR_TASK);
            await this.saveJobResult(code, false);

            if (cronType.code === cronTypeEnum.ONCE) {
                await this.disableTask(code);
            }

            if (cbError) {
                cbError(result);
            }
        });
    }

    public createTaskToTask(task: SchedulerData, func: () => void) {
        const { code, cronValue, interval } = task;
        const cronIntervalValue = this.getIntervalCronValue(interval);

        nodeSchedule.scheduleJob(code, cronValue, () => {
            nodeSchedule.scheduleJob(`${code}-interval`, cronIntervalValue, func);
        });
    }

    public getIntervalValue(interval: number) {
        if (interval >= this.yearValue) {
            return Math.round(interval / this.yearValue) * this.yearValue;
        }

        if (interval >= this.monthValue) {
            return Math.round(interval / this.monthValue) * this.monthValue;
        }

        if (interval >= this.dayValue) {
            return Math.round(interval / this.dayValue) * this.dayValue;
        }

        if (interval >= this.hourValue) {
            return Math.round(interval / this.hourValue) * this.hourValue;
        }

        return interval;
    }

    public getIntervalCronValue(interval: number) {
        if (interval >= this.yearValue) {
            return `00 00 00 00 */${Math.round(interval / this.yearValue)}`;
        }

        if (interval >= this.monthValue) {
            return `00 00 00 */${Math.round(interval / this.monthValue)} *`;
        }

        if (interval >= this.dayValue) {
            return `00 00 */${Math.round(interval / this.dayValue)} * *`;
        }

        if (interval >= this.hourValue) {
            return `00 */${Math.round(interval / this.hourValue)} * * *`;
        }

        return `*/${interval} * * * *`;
    }

    public getCronValue(cronType: string, time: string, interval?: number) {
        switch (cronType) {
            case cronTypeEnum.INTERVAL:
                return { cron: this.getIntervalCronValue(interval) };

            case cronTypeEnum.ONCE:
                return { cron: moment(time).format() };

            case cronTypeEnum.ONCE_A_DAY: {
                const [hours, minutes] = time.split(':');
                return { cron: `${minutes} ${hours} * * *` };
            }

            case cronTypeEnum.INTERVAL_WITH_START_DATE:
                return {
                    cron: moment(time).format(),
                    cronInterval: this.getIntervalCronValue(interval),
                };
        }
    }

    public async getSchedulerData(cronTypeId: number, priorityId: number) {
        const cronType = await this.entityManager.findOne(CronType, cronTypeId);

        if (!cronType) {
            const err = new CustomHttpException(
                {},
                {
                    EN: 'Task scheduler not found',
                    RU: 'Не найден тип планировщика задач',
                },
                HttpStatus.NOT_FOUND,
            );

            this.logger
                .sub()
                .setError(err)
                .errorLog('Не найден тип планировщика задач',
                    LogErrorCodesEnum.TASK_SCHEDULER_NOT_FOUND);

            throw err;
        }

        const prioritiesTask = await this.entityManager.findOne(PrioritiesTask, priorityId);

        if (!prioritiesTask) {
            const err = new CustomHttpException(
                {},
                {
                    EN: 'Task priority not found',
                    RU: 'Приоритет задач не найден',
                },
                HttpStatus.NOT_FOUND,
            );

            this.logger
                .sub()
                .setError(err)
                .errorLog('Приоритет задач не найден',
                    LogErrorCodesEnum.TASK_PRIORITY_NOT_FOUND);

            throw err;
        }

        return { cronType, prioritiesTask };
    }

    public getInitNextValue(cronType: string, time: string, interval: number) {
        switch (cronType) {
            case cronTypeEnum.INTERVAL:
                return moment()
                    .add(interval, 'minutes')
                    .toDate();
            case cronTypeEnum.ONCE_A_DAY: {
                const [hours, minutes] = time.split(':');
                const now = moment().toDate();

                let startTime = moment()
                    .set({
                        hours: Number(hours),
                        minutes: Number(minutes),
                        seconds: 0,
                    })
                    .toDate();

                if (now > startTime) {
                    startTime = moment(startTime)
                        .add(1, 'days')
                        .toDate();
                }

                return startTime;
            }

            case cronTypeEnum.ONCE:
                return moment(time).toDate();

            case cronTypeEnum.INTERVAL_WITH_START_DATE:
                return moment(time).toDate();

            default:
                const err = new CustomHttpException(
                    {},
                    {
                        EN: 'Error setting start time',
                        RU: 'Ошибка задания начального времени',
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );

                this.logger
                    .sub()
                    .setError(err)
                    .warnLog('Ошибка задания начального времени',
                        LogErrorCodesEnum.ERROR_SETTING_START_TIME);

                throw err;
        }
    }

    public async start({
      taskName,
      attempts,
      ttl,
      repeatDelay,
      cbSuccess,
      cbError,
      cbErrorAttempts,
    }: StartTaskDto) {
        const task = await this.getTaskData(taskName);

        const dataForTaskCreating = {
            attempts,
            cbError,
            cbErrorAttempts,
            cbSuccess,
            repeatDelay,
            task,
            ttl,
        };

        if (task.isActive) {
            if (task.cronType.code === cronTypeEnum.INTERVAL_WITH_START_DATE) {
                this.createTaskToTask(task, () => this.createQueue(dataForTaskCreating));
            } else {
                nodeSchedule.scheduleJob(task.code, task.cronValue, () =>
                    this.createQueue(dataForTaskCreating),
                );
            }
        }
    }

    public async createTask({
      taskName,
      data,
      attempts,
      ttl,
      repeatDelay,
      cbSuccess,
      cbError,
      cbErrorAttempts,
    }: CreateTaskDto) {
        try {
            const { time, cronTypeId, priorityId, specificTaskData, interval } = data;

            await this.cancelTask(taskName, true);

            const { cronType, prioritiesTask } = await this.getSchedulerData(cronTypeId, priorityId);
            const { cron, cronInterval } = this.getCronValue(cronType.code, time, interval);

            const task = await this.getTaskData(taskName);
            task.isActive = true;
            task.dateNext = this.getInitNextValue(cronType.code, time, interval);
            task.cronType = cronType;
            task.prioritiesTask = prioritiesTask;
            task.cronValue = cron;
            task.interval = interval ? this.getIntervalValue(interval) : null;

            if (specificTaskData) {
                task.data = JSON.stringify(specificTaskData);
            }

            await this.entityManager.save(task);

            const dataForTaskCreating = {
                attempts,
                cbError,
                cbErrorAttempts,
                cbSuccess,
                repeatDelay,
                task,
                ttl,
            };

            if (cronInterval) {
                this.createTaskToTask(task, () => this.createQueue(dataForTaskCreating));
            } else {
                nodeSchedule.scheduleJob(taskName, cron, () => this.createQueue(dataForTaskCreating));
            }

            Logger.log(`Задача "${taskName}" успешно запущена`);
        } catch (e) {
            this.logger
                .sub()
                .setError(e)
                .errorLog('Ошибка создания задания',
                    LogErrorCodesEnum.ERROR_TASK_CREATING);

            throw new CustomHttpException(e, {
                EN: 'Error task creating',
                RU: 'Ошибка создания задания',
            });
        }
    }

    public async cancelTask(code: string, isOnlyCancelCron?: boolean) {
        try {
            const task = nodeSchedule.scheduledJobs[code];
            const taskInterval = nodeSchedule.scheduledJobs[`${code}-interval`];

            if (task) {
                task.cancel();
            }

            if (taskInterval) {
                taskInterval.cancel();
            }

            if (!isOnlyCancelCron) {
                Logger.log(`Задача "${code}" остановлена`);
                await this.entityManager.update(SchedulerData, { code }, { isActive: false });
            }
        } catch (e) {
            this.logger
                .sub()
                .setError(e)
                .errorLog('Ошибка отмены задания',
                    LogErrorCodesEnum.ERROR_TASK_CANCELING);

            throw new CustomHttpException(e, {
                EN: 'Error task canceling',
                RU: 'Ошибка отмены задания',
            });
        }
    }

    public async saveJobResult(taskName: string, status: boolean) {
        if (status) {
            Logger.log(`Задача "${taskName}" выполнена успешно`);
        } else {
            Logger.log(`Задача "${taskName}" заверщилась с ошибкой`);
        }

        const dateNext = await this.getPastNextTime(taskName);

        await this.entityManager
            .update(
                SchedulerData,
                { code: taskName },
                {
                    dateEnd: moment().toDate(),
                    dateNext,
                    status,
                },
            )
            .catch(e => {
                this.logger
                    .sub()
                    .setError(e)
                    .errorLog('Ошибка сохранения результата выполненения задачи',
                        LogErrorCodesEnum.ERROR_SAVING_RESULT_TASK);

                throw new CustomHttpException(e, {
                    EN: 'Error saving the result of the task',
                    RU: 'Ошибка сохранения результата выполненения задачи',
                });
            });
    }

    public async getPastNextTime(taskName: string) {
        const schedulerData = await this.connection
            .getRepository(SchedulerData)
            .createQueryBuilder('schedulerData')
            .leftJoin('schedulerData.cronType', 'cronType')
            .where('schedulerData.code = :taskName', { taskName })
            .select([
                'schedulerData.dateNext as "dateNext"',
                'cronType.code as code',
                'schedulerData.interval as interval',
            ])
            .getRawOne();

        switch (schedulerData.code) {
            case cronTypeEnum.INTERVAL:
                return moment(schedulerData.dateNext)
                    .add(schedulerData.interval, 'minutes')
                    .toDate();
            case cronTypeEnum.ONCE_A_DAY:
                return moment(schedulerData.dateNext)
                    .add(1, 'days')
                    .toDate();
            case cronTypeEnum.ONCE:
                return moment(schedulerData.dateNext).toDate();
            case cronTypeEnum.INTERVAL_WITH_START_DATE:
                return moment(schedulerData.dateNext)
                    .add(schedulerData.interval, 'minutes')
                    .toDate();
        }
    }

    public async getTaskData(taskName) {
        return await this.entityManager.findOne(SchedulerData, {
            relations: ['cronType', 'prioritiesTask'],
            where: { code: taskName },
        });
    }

    public getTaskName(code: string) {
        return `${ENV}:${code}`;
    }

    public async disableTask(code: string) {
        await this.entityManager.update(SchedulerData, { code }, { isActive: false }).catch(e => {
            this.logger
                .sub()
                .setError(e)
                .errorLog('Ошибка отключения задания',
                    LogErrorCodesEnum.JOB_SHUTDOWN_ERROR);

            throw new CustomHttpException(e, {
                EN: 'Job shutdown error',
                RU: 'Ошибка отключения задания',
            });
        });
    }

    private async clearJobs(type: string, ttl: unknown) {
        kue.Job.rangeByState(type, 0, Number.MAX_SAFE_INTEGER, 'asc', (err: any, jobs: any[]) => {
            const filteredEnvJobs = jobs.filter(job => {
                const isThisInstance = job.type.includes(ENV);
                const isOldTask = moment().valueOf() - job.created_at >= ttl;
                return isThisInstance && isOldTask;
            });

            filteredEnvJobs.forEach((item: { remove: () => void }) => {
                item.remove();
            });
        });
    }
}
