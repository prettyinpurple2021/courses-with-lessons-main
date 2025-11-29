import { Request, Response, NextFunction } from 'express';
import * as memberService from '../services/memberService.js';

/**
 * GET /api/community/members
 * Get all members with pagination and search
 */
export async function getMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, page = '1', limit = '20' } = req.query;

    const filters: any = {};
    if (search) filters.search = search as string;

    const pagination = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    const result = await memberService.getMembers(filters, pagination);

    res.json({
      success: true,
      data: {
        members: result.members,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / pagination.limit),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/community/members/:id
 * Get member profile by ID
 */
export async function getMemberById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const member = await memberService.getMemberById(id);

    if (!member) {
      res.status(404).json({
        success: false,
        error: { message: 'Member not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    return next(error);
  }
}

