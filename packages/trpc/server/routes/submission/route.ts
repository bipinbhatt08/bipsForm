import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
    submitFormInputModel,
    submitFormOutputModel,
    getFormSubmissionsInputModel,
    getFormSubmissionsOutputModel,
    getFormAnalyticsInputModel,
    getFormAnalyticsOutputModel,
} from "./model";
import { submissionService } from "../../services";

const TAGS = ["Submission"];
const getPath = generatePath("/submission");

export const submissionRouter = router({

    submitForm: publicProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/submitForm"),
                tags: TAGS,
            },
        })
        .input(submitFormInputModel)
        .output(submitFormOutputModel)
        .mutation(async ({ input }) => {
            const { id } = await submissionService.submitForm(input.formId, input.values)
            return { id }
        }),

    getFormSubmissions: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getFormSubmissions"),
                tags: TAGS,
            },
        })
        .input(getFormSubmissionsInputModel)
        .output(getFormSubmissionsOutputModel)
        .query(async ({ input, ctx }) => {
            return submissionService.getFormSubmissions(input.formId, ctx.user.id, input.page, input.pageSize, input.sortDir) as any
        }),

    getFormAnalytics: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getFormAnalytics"),
                tags: TAGS,
            },
        })
        .input(getFormAnalyticsInputModel)
        .output(getFormAnalyticsOutputModel)
        .query(async ({ input, ctx }) => {
            return submissionService.getFormAnalytics(input.formId, ctx.user.id)
        }),
})
