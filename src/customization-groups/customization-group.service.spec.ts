import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, ConflictException } from '@nestjs/common'
import { CustomizationGroupService } from './customization-group.service'
import { CustomizationGroupRepository } from './customization-group.repository'

describe('CustomizationGroupService', () => {
  let service: CustomizationGroupService
  let repository: CustomizationGroupRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<CustomizationGroupService>(CustomizationGroupService)
    repository = module.get<CustomizationGroupRepository>(CustomizationGroupRepository)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findOne', () => {
    it('should return a customization group when found', async () => {
      const customizationGroup = {
        id: '1',
        name: 'test-group',
        displayName: 'Test Group',
        description: 'Test description',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(repository, 'findById').mockResolvedValue(customizationGroup)

      expect(await service.findOne('1')).toEqual(customizationGroup)
    })

    it('should throw NotFoundException when customization group not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null)

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a customization group successfully', async () => {
      const createDto = {
        name: 'test-group',
        displayName: 'Test Group',
        description: 'Test description',
      }

      const createdGroup = {
        id: '1',
        ...createDto,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(repository, 'findByName').mockResolvedValue(null)
      jest.spyOn(repository, 'create').mockResolvedValue(createdGroup)

      expect(await service.create(createDto)).toEqual(createdGroup)
    })

    it('should throw ConflictException when customization group with same name exists', async () => {
      const createDto = {
        name: 'test-group',
        displayName: 'Test Group',
        description: 'Test description',
      }

      const existingGroup = {
        id: '1',
        ...createDto,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(repository, 'findByName').mockResolvedValue(existingGroup)

      await expect(service.create(createDto)).rejects.toThrow(ConflictException)
    })
  })
})
