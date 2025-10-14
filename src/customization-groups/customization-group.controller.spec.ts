import { Test, TestingModule } from '@nestjs/testing'
import { CustomizationGroupController } from './customization-group.controller'
import { CustomizationGroupService } from './customization-group.service'
import { CustomizationGroupRepository } from './customization-group.repository'

describe('CustomizationGroupController', () => {
  let controller: CustomizationGroupController
  let service: CustomizationGroupService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomizationGroupController],
      providers: [
        CustomizationGroupService,
        {
          provide: CustomizationGroupRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByName: jest.fn(),
            findActive: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            toggleActive: jest.fn(),
            reorderGroups: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<CustomizationGroupController>(CustomizationGroupController)
    service = module.get<CustomizationGroupService>(CustomizationGroupService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of customization groups', async () => {
      const result = { customizationGroups: [] }
      jest.spyOn(service, 'findAll').mockResolvedValue([])

      expect(await controller.findAll()).toEqual(result)
    })
  })

  describe('findActive', () => {
    it('should return an array of active customization groups', async () => {
      const result = { customizationGroups: [] }
      jest.spyOn(service, 'findActive').mockResolvedValue([])

      expect(await controller.findActive()).toEqual(result)
    })
  })

  describe('create', () => {
    it('should create a customization group', async () => {
      const createDto = {
        name: 'test-group',
        displayName: 'Test Group',
        description: 'Test description',
      }
      const result = {
        id: '1',
        ...createDto,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(service, 'create').mockResolvedValue(result)

      expect(await controller.create(createDto)).toEqual({ customizationGroup: result })
    })
  })
})
