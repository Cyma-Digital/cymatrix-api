import addressService from "@/services/address/address.service"
import { validateEmptyBody, validateIdParam } from "@utils/http"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const {
      userId,
      label,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      isDefault,
      createdBy,
      updatedBy,
    } = req.body

    const idUser = 1

    const address = await addressService.create({
      userId: idUser,
      label,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      isDefault,
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
    const id = validateIdParam(req)

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
    const id = validateIdParam(req)
    const data = validateEmptyBody(req)

    const address = await addressService.updatePartial(id, data)

    return res.status(200).send({ status: "success", data: address })
  } catch (error) {
    next(error)
  }
}
