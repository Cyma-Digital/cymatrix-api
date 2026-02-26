import {
  addressIdSchema,
  CreateAddressDto,
  createAddressSchema,
  UpdateAddressDto,
  updateAddressPartialSchema,
  updateAddressSchema,
} from "@/schemas/address/address.schemas"
import addressService from "@/services/address/address.service"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    // const data = req.body as CreateAddressDto
    const data = createAddressSchema.parse(req.body)

    const idUser = 1

    const address = await addressService.create({
      ...data,
      createdBy: idUser,
      updatedBy: idUser,
    })

    return res.status(201).json({
      status: "success",
      data: address,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const addresses = await addressService.listAll()

    return res.status(200).json({
      status: "success",
      data: addresses,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = addressIdSchema.parse(req.params)

    const address = await addressService.getById(id)

    return res.status(200).send({ status: "success", data: address })
  } catch (error) {
    next(error)
  }
}

export async function updatePartial(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = addressIdSchema.parse(req.params)
    // const data = req.body as UpdateAddressDto
    const data = updateAddressPartialSchema.parse(req.body)
    const userId = 1

    const address = await addressService.updatePartial(id, {
      ...data,
      updatedBy: userId,
    })

    return res.status(200).send({ status: "success", data: address })
  } catch (error) {
    next(error)
  }
}

export async function deleteAddress(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = addressIdSchema.parse(req.params)
    const userId = 1

    await addressService.delete(id, userId)

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
