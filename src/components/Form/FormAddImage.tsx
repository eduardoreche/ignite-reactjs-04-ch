import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface CreateImageFormData {
  image: string;
  title: string;
  description: string;
}
interface FormAddImageProps {
  closeModal: () => void;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = {
    image: {
      required: 'Arquivo obrigatório',
      validate: {
        lessThan10MB: files =>
          files[0]?.size < 10000000 || 'O arquivo deve ser menor que 10MB',
        acceptedFormats: files =>
          ['image/jpeg', 'image/png', 'image/gif'].includes(files[0]?.type) ||
          'Somente são aceitos arquivos PNG, JPEG e GIF',
      },
    },
    title: {
      required: 'Título obrigatório',
      minLength: {
        value: 2,
        message: 'Título deve ter no mínimo 2 caracteres',
      },
      maxLength: {
        value: 20,
        message: 'Título deve ter no máximo 20 caracteres',
      },
    },
    description: {
      required: 'Descrição obrigatório',
      maxLength: {
        value: 65,
        message: 'Descrição deve ter no máximo 65 caracteres',
      },
    },
  };

  // const queryClient = useQueryClient();

  const createImage = async (image: CreateImageFormData): Promise<void> => {
    const { data } = await api.post('/images', image);
    setImageUrl(data.image);
    setLocalImageUrl(data.image);
    closeModal();
  };

  const mutation = useMutation(createImage, {
    onSuccess: () => {
      toast({
        description: 'Imagem adicionada com sucesso!',
        status: 'success',
      });
    },
  });

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();
  const { errors } = formState;

  const onSubmit: SubmitHandler<CreateImageFormData> = async data => {
    try {
      if (!imageUrl) {
        toast({
          description: 'Imagem não existe',
          status: 'error',
        });

        return;
      }

      await mutation.mutateAsync({
        ...data,
        image: imageUrl,
      });
    } catch (err) {
      console.log(err);
      toast({
        description: 'Erro ao adicionar imagem',
        status: 'error',
      });
    } finally {
      reset();
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          {...register('image', { ...formValidations.image })}
          error={errors.image}
        />

        <TextInput
          placeholder="Título da imagem..."
          {...register('title', { ...formValidations.title })}
          error={errors.title}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          {...register('description', { ...formValidations.description })}
          error={errors.description}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
