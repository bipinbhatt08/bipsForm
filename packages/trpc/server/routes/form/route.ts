import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
    createFormFieldInputModel, createFormFieldOutputModel,
    createFormInputModel, createFormOutputModel,
    getMyFormsOutputModel,
    getFormFieldsInputModel, getFormFieldsOutputModel,
    getFormBySlugInputModel, getFormBySlugOutputModel,
    getPublicFormsOutputModel,
    updateFormInputModel, updateFormOutputModel,
    deleteFormInputModel, deleteFormOutputModel,
    getFormByIdInputModel, getFormByIdOutputModel,
} from "./model";
import { formService,formfieldService } from "../../services";


const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({

    getMyForms: authenticatedProcedure
    .meta({
     openapi:{
      method:"GET",
      path:getPath("/getMyForms"),
      tags:TAGS
     }
    })
    .output(getMyFormsOutputModel)
    .query(async({ ctx }) => {
        return formService.getMyForms(ctx.user.id)
    }),

    createForm: authenticatedProcedure
    .meta({
     openapi:{
      method:"POST",
      path:getPath("/createForm"),
      tags:TAGS
     }
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async({input,ctx})=>{
        const { id, slug } = await formService.createForm(ctx.user.id, input)
        return { id, slug}
    }),

    createFormField: authenticatedProcedure
    .meta({
    openapi:{
      method:"POST",
      path:getPath("/createFormField"),
      tags:TAGS
    }
    })
    .input(createFormFieldInputModel)
    .output(createFormFieldOutputModel)
    .mutation(async({ctx,input})=>{
        const {id} = await formfieldService.createFormField(ctx.user.id, input)
        return {id}
    }),

    getFormBySlug: publicProcedure
    .meta({
        openapi:{
            method:"GET",
            path:getPath("/getFormBySlug"),
            tags:TAGS
        }
    })
    .input(getFormBySlugInputModel)
    .output(getFormBySlugOutputModel)
    .query(async({ input }) => {
        return formService.getFormWithFieldsBySlug(input.slug) as any
    }),

    getPublicForms: publicProcedure
    .meta({ openapi:{ method:"GET", path:getPath("/getPublicForms"), tags:TAGS } })
    .output(getPublicFormsOutputModel)
    .query(async () => {
        return formService.getPublicForms()
    }),

    getFormFields: publicProcedure
    .meta({
        openapi:{
            method:"GET",
            path:getPath("/getFormFields"),
            tags:TAGS
        }
    })
    .input(getFormFieldsInputModel)
    .output(getFormFieldsOutputModel)
    .query(async({ input }) => {
        return formfieldService.getFormFields(input.formId) as any
    }),

    getFormById: authenticatedProcedure
    .meta({ openapi:{ method:"GET", path:getPath("/getFormById"), tags:TAGS } })
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async({ input, ctx }) => {
        return formService.getFormById(input.formId, ctx.user.id) as any
    }),

    updateForm: authenticatedProcedure
    .meta({ openapi:{ method:"PATCH", path:getPath("/updateForm"), tags:TAGS } })
    .input(updateFormInputModel)
    .output(updateFormOutputModel)
    .mutation(async({ input, ctx }) => {
        const { formId, ...rest } = input
        await formService.updateForm(formId, ctx.user.id, rest)
        return { success: true }
    }),

    deleteForm: authenticatedProcedure
    .meta({ openapi:{ method:"DELETE", path:getPath("/deleteForm"), tags:TAGS } })
    .input(deleteFormInputModel)
    .output(deleteFormOutputModel)
    .mutation(async({ input, ctx }) => {
        await formService.deleteForm(input.formId, ctx.user.id)
        return { success: true }
    }),
})